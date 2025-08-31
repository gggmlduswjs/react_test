import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaStar, FaUser, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import logo from "./images/logo.png";

const Jungsung = () => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [question, setQuestion] = useState("ㅏ"); // 현재 표시된 모음(중성)
  const [braillePattern, setBraillePattern] = useState(""); // 점자 패턴
  const [loading, setLoading] = useState(false); // 전송 중 상태
  const [isFetchingBraille, setIsFetchingBraille] = useState(false); // 점자 데이터 로딩 상태

  const toggleFavorite = () => setIsFavorited(!isFavorited);

  const brailleList = ["ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ", "ㅕ", "ㅖ","ㅗ", "ㅘ","ㅙ","ㅚ", "ㅛ","ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ", "ㅡ","ㅢ","ㅣ"];
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextQuestion = () => setCurrentIndex((prev) => (prev + 1) % brailleList.length);
  const prevQuestion = () => setCurrentIndex((prev) => (prev - 1 + brailleList.length) % brailleList.length);

  useEffect(() => {
    setQuestion(brailleList[currentIndex]);
    handleFetchBraille(brailleList[currentIndex]); // 백엔드에서 현재 자음의 점자 패턴 가져오기
  }, [currentIndex]);

  // 📌 GET 요청: 백엔드에서 현재 자음에 해당하는 점자 패턴 가져오기
  const handleFetchBraille = async (char) => {
    setIsFetchingBraille(true); // 점자 데이터 로딩 시작
    try {
      const response = await axios.get("http://192.168.0.2:8000/accountapp/braille-patterns/", {
        params: { character: char },
      });

      if (response.data && response.data.length > 0) {
        setBraillePattern(response.data[0].braille_pattern || ""); // 점자 패턴 업데이트
        console.log("점자 데이터:", response.data[0].braille_pattern);
      }
    } catch (error) {
      console.error("점자 데이터 가져오기 실패:", error);
    }
    setIsFetchingBraille(false); // 점자 데이터 로딩 완료
  };

  // 📌 POST 요청: 점자 데이터를 아두이노로 전송하는 함수
  const handleSendToArduino = async () => {
  if (!braillePattern) {
    alert("보낼 점자 데이터가 없습니다.");
    return;
  }

  setLoading(true);

  try {
    // braillePattern: "010101,101010" 등
    // => ["010101", "101010"] 배열로 분리 후
    // 각 문자열을 숫자 배열로 변환
    const matrix = braillePattern.split(",").map(str =>
      str.split("").map(ch => Number(ch))
    );

    const requestData = {
      matrix: matrix,
    };

    const response = await axios.post("http://192.168.0.18:5000/braille", requestData, {
      headers: { "Content-Type": "application/json" },
    });

    if (response.status === 200) {
      alert("점자 데이터가 성공적으로 전송되었습니다!");
    } else {
      alert("점자 데이터 전송에 실패했습니다.");
    }
  } catch (error) {
    console.error("점자 데이터 전송 실패:", error);
    alert("점자 데이터 전송 중 오류가 발생했습니다.");
  }

  setTimeout(() => {
    setLoading(false);
  }, 500);
};

  // 📌 6점자로 변환하는 함수
  const convertToBrailleDots = (brailleCode) => {
    if (!brailleCode || brailleCode.length !== 6) return [];

    return [
      [brailleCode[0], brailleCode[3]],
      [brailleCode[1], brailleCode[4]],
      [brailleCode[2], brailleCode[5]],
    ];
  };

  const renderBrailleBlocks = (braillePattern) => {
    if (isFetchingBraille || !braillePattern) {
      // 점자 데이터가 없거나 로딩 중이면, 비어있는 보더박스와 출력 버튼만 표시
      return (
        <div
          style={{
            border: "3px solid black", 
            borderRadius: "10px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "350px", 
            height: "350px", 
            margin: "auto",
            position: "relative",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
            {/* 비어있는 상태로 점자 박스만 표시 */}
          </div>
  
          {/* 아두이노 전송 버튼 */}
          <div
            style={{
              position: "absolute",
              bottom: "-80px",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <button
              onClick={handleSendToArduino}
              disabled={loading}
              style={{
                padding: "10px 20px",
                fontSize: "18px",
                fontWeight: "bold",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "5px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              {loading ? "전송 중..." : "출력"}
            </button>
          </div>
        </div>
      );
    }
  
    // 점자 데이터가 있을 때만 점자 블록을 렌더링
    const brailleCodes = braillePattern.split(",");
    
    const rows = [];
    for (let i = 0; i < brailleCodes.length; i += 2) {
      rows.push([brailleCodes[i], brailleCodes[i + 1] || "000000"]);
    }
  
    return (
      <div
        style={{
          border: "3px solid black", 
          borderRadius: "10px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "350px", 
          height: "350px", 
          margin: "auto",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
          {rows.map((row, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                justifyContent: "center",
                marginBottom: "10px",
              }}
            >
              {row.map((brailleCode, subIndex) => (
                <div
                  key={subIndex}
                  style={{
                    width: "70px",
                    height: "120px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "32px",
                    fontWeight: "bold",
                    textAlign: "center",
                    lineHeight: "1.5",
                    margin: "5px",
                  }}
                >
                  {convertToBrailleDots(brailleCode).map((dotRow, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "center" }}>
                      {dotRow.map((dot, j) => (
                        <span key={j} style={{ margin: "5px", fontSize: "24px" }}>
                          {dot === "1" ? "●" : "○"}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
  
        {/* 아두이노 전송 버튼 */}
        <div
          style={{
            position: "absolute",
            bottom: "-80px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <button
            onClick={handleSendToArduino}
            disabled={loading}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#007bff",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            {loading ? "전송 중..." : "출력"}
          </button>
        </div>
      </div>
    );
  };
  
  

  
  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* 로고 */}
      <div
        style={{ position: "absolute", top: "20px", left: "20px", cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" style={{ height: "50px", width: "auto" }} />
      </div>

      <div style={{ marginTop: "60px" }}>
        {/* 즐겨찾기 및 마이페이지 */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
          <FaStar size={24} onClick={toggleFavorite} color={isFavorited ? "gold" : "gray"} style={{ cursor: "pointer" }} />
          <FaUser size={24} onClick={() => alert("마이페이지 이동")} style={{ cursor: "pointer" }} />
        </div>

        <h1>점자 학습</h1>

        {/* 자음 & 점자 박스 배치 */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "40px",
            padding: "0 20%",
          }}
        >
          {/* 자음 박스 (왼쪽) */}
          <div
            style={{
              position: "relative",
              border: "3px solid black",
              borderRadius: "10px",
              width: "350px",
              height: "350px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "96px",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            
            {question}

            {/* 화살표 (하단 양 끝 배치) */}
            <FaArrowLeft size={40} onClick={prevQuestion} style={{ position: "absolute", bottom: "-70px", left: "0", cursor: "pointer" }} />
            <FaArrowRight size={40} onClick={nextQuestion} style={{ position: "absolute", bottom: "-70px", right: "0", cursor: "pointer" }} />
          </div>

          {/* 중앙 화살표 추가 */}
          <div style={{ fontSize: "48px", fontWeight: "bold" }}>→</div>

          {/* 점자 박스 (오른쪽) */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              width: "350px",  // 크기 일치
              height: "350px",
            }}
          >
            {renderBrailleBlocks(braillePattern)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jungsung;
