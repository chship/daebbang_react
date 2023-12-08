import ReactQuill from "react-quill";
import style from "../../css/WriteBoard/WriteBoard.module.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

const RoomBoardWrite = () => {
    const navi = useNavigate();

    const [boardContents, setBoardContents] = useState({boardTitle:"양도게시판",title:"",contents:"",header:""});

    const handleChange = (e) => {
        const {name,value} = e.target;
        setBoardContents(prev=>({...prev,[name]:value}));
    }

    const handleHeaderChange = (e) => {
        setBoardContents(prev=>({...prev,header:e.target.value}));
    }

    const handleAdd = () => {
        console.log(boardContents);
        axios.post("/api/board",boardContents).then(resp=>{
            alert("게시글 등록에 성공하였습니다");
            navi("/board/toRoomBoardList");
        }).catch(err=>{
            alert("게시글 등록에 실패하였습니다");
            console.log(err);
        })
    }

    const modules = {
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, false] }],
                ["header", "bold", "italic", "underline", "strike", "blockquote",
                    { list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" },
                    "bullet", "indent", "link", "image",
                    { align: [] }, { color: [] }, { background: [] },
                    "clean"]
            ],
        },
    };

    const formats = [
        "header",
        "bold",
        "italic",
        "underline",
        "strike",
        "blockquote",
        "list",
        "bullet",
        "indent",
        "align",
        "color",
        "background",
        "link",
        "image",
    ];

    return (
        <>
            <div className={style.boardTitle}>양도게시판 글 작성</div>
            <hr></hr>
            <div>
                <div>제목</div>
                <div>
                    <input placeholder="제목을 입력해주세요" name="title" onChange={handleChange}/>
                </div>
            </div>
            <div>
                <div>말머리</div>
                <div>
                    <select onChange={handleHeaderChange}>
                        <option selected>말머리를 선택해주세요</option>
                        <option>양도합니다</option>
                        <option>양도 구합니다</option>
                    </select>
                </div>
            </div>
            <div>
                <div>파일첨부</div>
                <div><input type="file" /></div>
            </div>
            <div>
                <div>내용</div>
                <div>
                    <ReactQuill id="editor" className={style.reactQuill} value={boardContents.contents} onChange={(value) => setBoardContents({ ...boardContents, contents: value })}/>
                </div>
            </div>

            <div>
                <Link to="/board/toRoomBoardList"><button>작성 취소</button></Link>
                <button onClick={handleAdd}>작성 완료</button>
            </div>
        </>
    );
}

export default RoomBoardWrite;