import React, { useState, useEffect } from "react";
import axios from "axios";      // 아두이노 전송용
import api from "./api";        // Django 백엔드 전송용
import { useNavigate } from "react-router-dom";
import logo from "./images/logo.png";

function TextPage() {
  const navigate = useNavigate();
  const [textInput, setTextInput] = useState("");
  const [brailleInfo, setBrailleInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const el = document.getElementById("braille-container");
    if (el) el.style.marginTop = "20px";
  }, []);

  const handleTextInputChange = (e) => setTextInput(e.target.value);

  const handleSendToServer = async () => {
    if (!textInput.trim()) {
      alert("텍스트를 입력하세요.");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.append("converted_text", textInput);

    try {
      // Django 서버로 전송 (api 인스턴스 사용)
      const res = await api.post("/accountapp/text-only/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (Array.isArray(res.data)) {
        setBrailleInfo(res.data);
      } else {
        alert("점자 데이터를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error("텍스트 전송 오류:", err);
      alert("서버로 텍스트를 전송하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 6점자 변환
  const convertMatrixToBrailleDots = (matrixList) => {
    if (!Array.isArray(matrixList)) return [];
    return matrixList
      .map((m) => {
        if (!Array.isArray(m) || m.length !== 6) return null;
        return [
          [m[0], m[3]],
          [m[1], m[4]],
          [m[2], m[5]],
        ];
      })
      .filter(Boolean);
  };

  // 점자 블록 렌더링
  const renderBrailleBlocks = (info) => {
    if (!info || !Array.isArray(info)) return null;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", padding: 10 }}>
        {info.map((charData, idx) => (
          <div key={idx} style={{ margin: 10 }}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
              {convertMatrixToBrailleDots(charData.braille_matrix).map((dots, i) => (
                <div key={i} style={{ marginRight: 15 }}>
                  {dots.map((row, j) => (
                    <div key={j} style={{ display: "flex", justifyContent: "center" }}>
                      {row.map((dot, k) => (
                        <span key={k} style={{ fontSize: 24, margin: 2 }}>
                          {dot === 1 ? "●" : "○"}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 아두이노 전송 (외부 IP → axios 직접 사용)
  const sendToArduino = async () => {
    if (!brailleInfo || !Array.isArray(brailleInfo)) {
      alert("전송할 점자 정보가 없습니다.");
      return;
    }
    try {
      const res = await axios.post(
        "http://192.168.0.18:5000/braille",
        { matrix: brailleInfo },
        { headers: { "Content-Type": "application/json" }, withCredentials: false }
      );
      alert(res.status === 200 ? "출력 성공" : "출력 실패");
    } catch (e) {
      console.error("전송 오류:", e);
      alert("전송 중 오류 발생.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 20 }}>
      <div
        style={{ position: "absolute", top: 20, left: 20, cursor: "pointer" }}
        onClick={() => navigate("/")}
      >
        <img src={logo} alt="Logo" style={{ height: 50, width: "auto" }} />
      </div>

      <h1>BRAILLE</h1>
      <h2 style={{ color: "#009688" }}>텍스트 → 점자 변환</h2>

      <div
        style={{
          marginBottom: 20,
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 10,
          width: "80%",
          margin: "auto",
        }}
      >
        <h3>입력할 텍스트</h3>
        <textarea
          style={{ width: "95%", height: 150, padding: 10, fontSize: 16 }}
          value={textInput}
          onChange={handleTextInputChange}
          placeholder="여기에 텍스트를 입력하세요."
        />
        <div style={{ textAlign: "right", fontSize: 14, color: "#777" }}>
          {textInput.length}/5000
        </div>
      </div>

      <button
        onClick={handleSendToServer}
        disabled={loading}
        style={{
          padding: "10px 20px",
          fontSize: 16,
          backgroundColor: "#009688",
          color: "white",
          border: "none",
          borderRadius: 5,
          cursor: "pointer",
          marginTop: 20,
        }}
      >
        {loading ? "전송 중..." : "전송"}
      </button>

      <div
        id="braille-container"
        style={{
          padding: 50,
          border: "1px solid #009688",
          borderRadius: 10,
          backgroundColor: "#f9f9f9",
          width: "80%",
          margin: "20px auto 0",
        }}
      >
        <h3 style={{ color: "#009688" }}>6점자 표현</h3>
        {loading ? (
          <p style={{ color: "#777" }}>점자 데이터를 불러오는 중...</p>
        ) : brailleInfo ? (
          renderBrailleBlocks(brailleInfo)
        ) : (
          <p style={{ color: "#777" }}>점자 변환 결과가 여기에 표시됩니다.</p>
        )}
      </div>

      <div style={{ marginTop: 40 }}>
        <button
          onClick={sendToArduino}
          style={{
            padding: "12px 24px",
            fontSize: 16,
            backgroundColor: "#009688",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          출력
        </button>
      </div>
    </div>
  );
}

export default TextPage;
