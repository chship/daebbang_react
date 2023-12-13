//
import { useState, useEffect } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import {
  Map,
  MapMarker,
  ZoomControl,
  MarkerClusterer,
} from "react-kakao-maps-sdk";

//
import { markerdata } from "./data/markerData"; // 마커 데이터 가져오기

//
import $ from "jquery";
import axios from "axios";

//
import List from "./List/List";
import Info from "./Info/Info";

//
import style from "./OneRoom.module.css";

function OneRoom() {
  const [mapRendered, setMapRendered] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(6);

  const [mapList, setMapList] = useState([{}]);

  const [positions, setPositions] = useState([]);

  const navigate = useNavigate();

  // NPM INSTALL 하면서 받은 카카오 정보들이
  // 로컬에 저장되어 있기 때문에 불러옴
  const { kakao } = window;

  // 1. 로딩 될때 화면 드레그 발동
  // 2. 지도 화면은 한번만 로딩 되게
  useEffect(() => {
    setMapRendered(true);
    handleDragEnd();
    axios
      .get(`/api/map/getAll`)
      .then((resp) => {
        setMapList(resp.data);
        setMapRendered(true);
        handleDragEnd();
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

  // 페이지 로딩 시 사용할 기본 경계 반환
  const getDefaultBounds = () => {
    return new kakao.maps.LatLngBounds(
      new kakao.maps.LatLng(36, 127),
      new kakao.maps.LatLng(37, 128)
    );
  };

  // 지도에서 마우스 드레그 이벤트 발생시 마커 새로 불러오기
  const handleDragEnd = (map) => {
    // map 인자가 받지 못한건 처음 페이지 켤때니까
    // get Bouns에 기본 바운스를 넣어줌 안 그럼 맵이 없어서 값이 없음
    if (!map) {
      map = {
        getBounds: () => getDefaultBounds(),
      };
    }

    // 현재 지도의 경계를 맵 인자에서 가져옴
    const bounds = map.getBounds();

    // 경계(현재 화면)에 포함된 마커들 찾기
    const markersInBounds = mapList.filter((marker) => {
      const markerPosition = new kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );
      return bounds.contain(markerPosition);
    });

    // 콘솔에 마커 갯수와 정보 찍기
    // console.log("마커 갯수:", markersInBounds.length);
    // console.log("마커 정보:", markersInBounds);

    // 이벤트가 발생하면 페이지 이동
    navigate("/home/oneroom/list", { state: { markersInBounds } });
  };

  // 지도에서 휠을 활용한 줌 이벤트 발생시 마커 새로 불러오기
  const handleZoomChanged = (map) => {
    // Zoom level이 변경되면 페이지 이동
    setZoomLevel(map.getLevel());

    // 현재 지도의 경계를 맵 인자에서 가져옴
    const bounds = map.getBounds();

    // 경계(현재 화면)에 포함된 마커들 찾기
    const markersInBounds = mapList.filter((marker) => {
      const markerPosition = new kakao.maps.LatLng(
        marker.latitude,
        marker.longitude
      );
      return bounds.contain(markerPosition);
    });

    // 이벤트가 발생하면 페이지 이동하면서 바뀐 경계 (현재 화면) 값을 넘김
    navigate(`/home/oneroom/list?zoom=${map.getLevel()}`, {
      state: { markersInBounds },
    });
  };

  // 마커를 클릭할때 해당 정보를 들고 info(정보)로 이동
  const handleMarkerClick = (marker) => {
    navigate("/home/oneroom/info", { state: marker });
  };

  return (
    <div>
      {" "}
      {/* className="container"*/}
      <div className={style.home_top}>
        <div>방 찾기</div>
        <div>찜한 매물</div>
        <div>방 내놓기(전월세만)</div>
        <div>
          <Link to="list">Go to List</Link>
        </div>
        <div>
          <Link to="info">Go to Info</Link>
        </div>
      </div>
      <div className={style.main_box}>
        <div className={style.home_body_map}>
          <div className={style.home_body_map_main}>
            {mapRendered && (
              <Map
                center={{ lat: 36.84142696925057, lng: 127.14542099214732 }}
                style={{ width: "100%", height: "100%" }}
                level={zoomLevel}
                onDragEnd={handleDragEnd}
                onZoomChanged={handleZoomChanged}
              >
                <MarkerClusterer
                  averageCenter={true}
                  minLevel={1}
                  calculator={[1, 2, 5]}
                  styles={[
                    {
                      // calculator 각 사이 값 마다 적용될 스타일을 지정한다
                      width: "30px",
                      height: "30px",
                      background: "rgba(51, 204, 255, .8)",
                      borderRadius: "15px",
                      color: "#000",
                      textAlign: "center",
                      fontWeight: "bold",
                      lineHeight: "31px",
                    },
                    {
                      width: "40px",
                      height: "40px",
                      background: "rgba(255, 153, 0, .8)",
                      borderRadius: "20px",
                      color: "#000",
                      textAlign: "center",
                      fontWeight: "bold",
                      lineHeight: "41px",
                    },
                    {
                      width: "50px",
                      height: "50px",
                      background: "rgba(255, 51, 204, .8)",
                      borderRadius: "25px",
                      color: "#000",
                      textAlign: "center",
                      fontWeight: "bold",
                      lineHeight: "51px",
                    },
                    {
                      width: "60px",
                      height: "60px",
                      background: "rgba(255, 80, 80, .8)",
                      borderRadius: "30px",
                      color: "#000",
                      textAlign: "center",
                      fontWeight: "bold",
                      lineHeight: "61px",
                    },
                  ]}
                >
                  {markerdata.map((marker, index) => (
                    <MapMarker
                      key={index}
                      position={{ lat: marker.latitude, lng: marker.longitude }}
                      options={{ title: marker.title }}
                      onClick={() => handleMarkerClick(marker)}
                    />
                  ))}
                </MarkerClusterer>
              </Map>
            )}
          </div>
          <div className={style.home_body_map_search}>asd</div>
        </div>
        <div className={style.home_body_side}>
          <Routes>
            <Route path="list" element={<List />} />
            <Route path="info" element={<Info />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default OneRoom;
