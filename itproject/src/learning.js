import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./images/logo.png"; // 로고 추가

document.addEventListener("DOMContentLoaded", function () {
  let viewport = document.querySelector("meta[name=viewport]");
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }
  viewport.setAttribute("content", "width=1024");
});

const Lerning = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      {/* 로고 (왼쪽 상단 고정) */}
      <div style={logoContainerStyle} onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" style={logoImageStyle} />
      </div>

      {/* 메뉴 제목 */}
      <div style={menuStyle}>점자 학습</div>

      {/* 버튼 목록 */}
      <div style={buttonContainerStyle}>
        <div style={buttonWrapperStyle}>
          <button onClick={() => navigate("/chosung")} style={buttonStyle}>
            <span style={buttonTextStyle}>초성 학습</span>
            <span style={iconTextStyle}>ㄱ</span>
          </button>
        </div>
        <div style={buttonWrapperStyle}>
          <button onClick={() => navigate("/jungsung")} style={buttonStyle}>
            <span style={buttonTextStyle}>중성 학습</span>
            <span style={iconTextStyle}>ㅏ</span>
          </button>
        </div>
        <div style={buttonWrapperStyle}>
          <button onClick={() => navigate("/jongsung")} style={buttonStyle}>
            <span style={buttonTextStyle}>종성 학습</span>
            <span style={iconTextStyle}>ㄳ</span>
          </button>
        </div>
        <div style={buttonWrapperStyle}>
          <button onClick={() => navigate("/yakja")} style={buttonStyle}>
            <span style={buttonTextStyle}>약자 학습</span>
            <span style={iconTextStyle}>가</span>
          </button>
        </div>
        <div style={buttonWrapperStyle}>
          <button onClick={() => navigate("/yakeo")} style={buttonStyle}>
            <span style={buttonTextStyle}>약어 학습</span>
            <span style={iconTextStyle}>그래서</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// 스타일 정의
const containerStyle = {
  textAlign: "center",
  padding: "20px",
  paddingTop: "80px",
  fontFamily: "Arial, sans-serif",
  minHeight: "100vh",
  backgroundColor: "#fff",
};

const logoContainerStyle = {
  position: "absolute",
  top: "10px",
  left: "10px",
  cursor: "pointer",
};

const logoImageStyle = {
  height: "50px",
  width: "auto",
};

const menuStyle = {
  backgroundColor: "#aee4ad",
  padding: "15px",
  borderRadius: "8px",
  fontSize: "24px",
  fontWeight: "bold",
  color: "#fff",
  textAlign: "center",
  width: "65%",
  margin: "40px auto 20px",
};

const buttonContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "20px",
  marginTop: "10px",
};

const buttonWrapperStyle = {
  position: "relative",
  width: "80%",
  maxWidth: "1000px",
};

const buttonStyle = {
  position: "relative",
  width: "100%",
  padding: "50px",
  fontSize: "28px",
  border: "none",
  borderRadius: "25px",
  backgroundColor: "#d3d3d3",
  color: "#000",
  cursor: "pointer",
  fontWeight: "bold",
  textAlign: "center",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.2s",
  display: "flex",
  alignItems: "center",
  justifyContent: "center", // 가운데 정렬
};

const buttonTextStyle = {
  position: "relative",
  zIndex: 1,
};

const iconTextStyle = {
  position: "absolute",
  right: "30px",
  top: "50%",
  transform: "translateY(-50%)",
  fontSize: "32px",
  backgroundColor: "#fff",
  padding: "10px 18px",
  borderRadius: "10px",
  border: "2px solid #ccc",
};

export default Lerning;
