import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "./images/logo.png";

// ⬇️ 아이콘 추가
import { FaFont, FaBraille, FaQuestionCircle, FaCamera } from "react-icons/fa";
import { FaRegFilePdf } from "react-icons/fa6";
import { IoText } from "react-icons/io5";

document.addEventListener("DOMContentLoaded", function () {
  let viewport = document.querySelector("meta[name=viewport]");
  if (!viewport) {
    viewport = document.createElement("meta");
    viewport.name = "viewport";
    document.head.appendChild(viewport);
  }
  viewport.setAttribute("content", "width=1024");
});

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div style={containerStyle}>
      <div style={logoContainerStyle} onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" style={logoImageStyle} />
      </div>

      <div style={menuStyle}>목록</div>

      <div style={buttonContainerStyle}>
        <button onClick={() => navigate("/file-uploads")} style={buttonStyle}>
          <FaRegFilePdf style={iconStyle} /> PDF
        </button>
        <button onClick={() => navigate("/text")} style={buttonStyle}>
          <IoText style={iconStyle} /> 텍스트
        </button>
        <button onClick={() => navigate("/learning")} style={buttonStyle}>
          <FaBraille style={iconStyle} /> 점자 학습
        </button>
        <button onClick={() => navigate("/quizlearning")} style={buttonStyle}>
          <FaQuestionCircle style={iconStyle} /> 점자 퀴즈
        </button>
        <button onClick={() => navigate("/camera")} style={buttonStyle}>
          <FaCamera style={iconStyle} /> 이미지 촬영
        </button>
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

const buttonStyle = {
  display: "flex", // ⬅️ 아이콘과 텍스트 나란히
  alignItems: "center",
  justifyContent: "center",
  gap: "15px",
  width: "80%",
  maxWidth: "1000px",
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
};

const iconStyle = {
  fontSize: "32px",
};

export default HomePage;
