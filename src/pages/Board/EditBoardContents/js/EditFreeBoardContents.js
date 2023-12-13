import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import style from "../../Write/css/WriteBoard/WriteBoard.module.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useMemo, useRef, useEffect } from "react";
import axios from "axios";

const EditFreeBoardContents = () => {
    const location = useLocation();
    const navi = useNavigate();
    const quillRef = useRef();
    const [formData, setFormData] = useState({
        set:0,
        title: "",
        contents: "",
        files: []
    });
    const [fileList, setFileList] = useState([{}]);
    const [sysNameList,setSysNameList] = useState([]);
    // 게시글 내용 받아오기
    useEffect(()=>{
        axios.get(`/api/board/boardContents/${location.state.sysSeq}`).then(resp=>{
            setFormData(prev=>({...prev,title:resp.data.title,contents:resp.data.contents,seq:resp.data.seq}));
            setFileList(resp.data.files);
            setSysNameList(prev=>existImgSearch(resp.data.contents));
        }).catch(err => {
            console.log(err);
        })
    },[]);

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, files: [...prev.files, e.target.files[0]] }));
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    }
    

    const imageHandler = (file) => {
        // 이미지 선택 창 나타나게 하기
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("multiple", "true");
        input.setAttribute("accept", "image/*");
        input.click();

        // 이미지 선택 시 동작
        input.addEventListener("change", async () => {
            const files = input.files;

            const formImg = new FormData();
            for (let i = 0; i < files.length; i++) {
                formImg.append("files", files[i]);
            }
            try {
                const imgUrl = await axios.post("/api/file/upload", formImg);
                const editor = quillRef.current.getEditor();
                const range = editor.getSelection();

                for (let i = 0; i < imgUrl.data.length; i++) {
                    setSysNameList(prev=>[...prev,imgUrl.data[i].split("/uploads/board/")[1]]);
                    editor.insertEmbed(range.index, 'image', imgUrl.data[i]);
                }
                
            } catch (error) {
                console.log(error);
            }
        })
    }

    let existImgSearch = (contents) => { // 게시글 내용에 존재하는 태그 뽑아내기 ( sysName )
        const imgSrcRegex = /<img[^>]*src=["']\/uploads\/board\/([^"']+)["'][^>]*>/g;
        let existImgList = [];
        let match;
        while ((match = imgSrcRegex.exec(contents)) !== null) {
            existImgList.push(match[1]);
        }
        return existImgList;
    }

    let submitImgSearch = (uploadList, sysNameList) => { // 삭제된 이미지 태그 뽑아내기
        let exist = false;
        let delImgList = [];
        for(let i=0;i<sysNameList.length;i++){
            for(let j=0;j<uploadList.length;j++){
                if(sysNameList[i] === uploadList[j]){
                    exist = true;
                    break;
                }
            }
            exist ? exist=false : delImgList.push(sysNameList[i]);
        }
        return delImgList;
    }

    const [delFileList,setDelFileList] =useState([]);
    const handleRemoveFileChange = (sysName) => {
        if(window.confirm("파일을 정말 삭제하시겠습니까?")){
            setDelFileList(prev=>[...prev,sysName]);
            setFileList(fileList.filter(e=>e.sysName!==sysName));
            alert("삭제되었습니다");
        }
    }

    const handleAdd = () => {
        console.log(delFileList);

        let existImgList = existImgSearch(formData.contents);
        let delImgList = submitImgSearch(existImgList,sysNameList);

        if (formData.title === "") {
            alert("제목을 입력해주세요");
            return;
        }

        if (formData.title > 50) {
            alert("제목은 최대 50글자 입니다");
            return;
        }

        if (formData.contents === "") {
            alert("내용을 입력해주세요");
            return;
        }

        if (formData.contents.length > 3000) {
            alert("내용은 최대 3000글자 입니다");
            return;
        }
        console.log(delFileList);
        const submitFormData = new FormData();
        submitFormData.append("boardTitle", "자유게시판");
        submitFormData.append("seq", formData.seq);
        submitFormData.append("title", formData.title);
        submitFormData.append("contents", formData.contents);
        submitFormData.append("delImgList",delImgList);
        submitFormData.append("delFileList",delFileList);

        formData.files.forEach((e) => {
            console.log(e.oriName+"oriName");
            submitFormData.append("files", e);
        });

        axios.put("/api/board", submitFormData).then(resp => {
            alert("게시글 수정에 성공하였습니다");
            navi("/board/toFreeBoardList");
        }).catch(err => {
            alert("게시글 수정에 실패하였습니다");
            console.log(err);
        })
    }

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ header: [1, 2, 3, 4, 5, false] }],
                ["header", "bold", "italic", "underline", "strike", "blockquote",
                    { list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" },
                    "bullet", "indent", "link", "image",
                    { align: [] }, { color: [] }, { background: [] },
                    "clean"]
            ],
            handlers: { image: imageHandler, },
        }
    }), []);

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
            <div className={style.boardTitle}>자유게시판 글 수정</div>
            <hr></hr>
            <div>
                <div>제목</div>
                <div>
                    <input placeholder="제목을 입력해주세요" name="title" onChange={handleChange} value={formData.title}/>
                </div>
            </div>
            <div>
                <div>파일 목록</div>
                {
                    fileList.map((e,i)=>{
                        return (
                            <div key={i}>{e.oriName}<span onClick={()=>{handleRemoveFileChange(e.sysName)}}>x</span></div>
                        );
                    })
                }
            </div>
            <div>
                <div>파일첨부</div>
                <div><input type="file" onChange={handleFileChange} /></div>
                <div><input type="file" onChange={handleFileChange} /></div>
                <div><input type="file" onChange={handleFileChange} /></div>
                <div><input type="file" onChange={handleFileChange} /></div>
                <div><input type="file" onChange={handleFileChange} /></div>
            </div>
            <div>
                <div>내용</div>
                <div>
                    <ReactQuill modules={modules} formats={formats} className={style.reactQuill} ref={quillRef}
                        value={formData.contents} onChange={(value) => setFormData({ ...formData, contents: value })} />
                </div>
            </div>

            <div>
                <Link to="/board/toFreeBoardList"><button>작성 취소</button></Link>
                <button onClick={handleAdd}>작성 완료</button>
            </div>
        </>
    );
}

export default EditFreeBoardContents;