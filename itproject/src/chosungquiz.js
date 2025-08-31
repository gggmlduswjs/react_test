import React, { useState, useEffect, useRef } from "react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaStar, FaUser, FaArrowLeft, FaArrowRight } from "react-icons/fa";
import logo from "./images/logo.png";

const Chosungquiz = () => {
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(false);
  const [question, setQuestion] = useState("?"); 
  const [braillePattern, setBraillePattern] = useState(""); 
  const [loading, setLoading] = useState(false); 
  const [fetchingBraille, setFetchingBraille] = useState(false); 
  const [userAnswer, setUserAnswer] = useState(""); 
  const [feedback, setFeedback] = useState(""); 
  const [accuracy, setAccuracy] = useState(100); 
  const [correctAnswers, setCorrectAnswers] = useState(0); 
  const [correctChars, setCorrectChars] = useState([]); 

  const toggleFavorite = () => setIsFavorited(!isFavorited);

  const brailleList = ["ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅅ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];
  const pronunciationMap = {"기역": "ㄱ","쌍기역": "ㄲ","니은": "ㄴ","디귿": "ㄷ","쌍디귿": "ㄸ","리을": "ㄹ","미음": "ㅁ","비읍": "ㅂ","시옷": "ㅅ","이응": "ㅇ","지읒": "ㅈ","치읓": "ㅊ","키읔": "ㅋ","티읕": "ㅌ","피읖": "ㅍ","히읗": "ㅎ"
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const recognitionRef = useRef(null);

const nextQuestion = () => {
  setUserAnswer("");  // 입력 초기화
  setFeedback("");    // 피드백 초기화
  setCurrentIndex((prev) => (prev + 1) % brailleList.length);
};

const prevQuestion = () => {
  setUserAnswer("");  // 입력 초기화
  setFeedback("");    // 피드백 초기화
  setCurrentIndex((prev) => (prev - 1 + brailleList.length) % brailleList.length);
};


  useEffect(() => {
    setQuestion("?"); 
    handleFetchBraille(brailleList[currentIndex]); 
  }, [currentIndex]);

  const handleFetchBraille = async (char) => {
    setFetchingBraille(true);
    try {
      const response = await axios.get('http://192.168.0.2:8000/accountapp/braille-patterns/', {
        params: { character: char },
      });

      if (response.data && response.data.length > 0) {
        setBraillePattern(response.data[0].braille_pattern || "");
      }
    } catch (error) {
      console.error("점자 데이터 가져오기 실패:", error);
    }
    setFetchingBraille(false);
  };

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


  const convertToBrailleDots = (brailleCode) => {
    if (!brailleCode || brailleCode.length !== 6) return [];

    return [
      [brailleCode[0], brailleCode[3]],
      [brailleCode[1], brailleCode[4]],
      [brailleCode[2], brailleCode[5]],
    ];
  };

  const renderBrailleBlocks = (braillePattern) => {
    const brailleCodes = braillePattern ? braillePattern.split(",") : [];

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
        {rows.length === 1 ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100%",
            }}
          >
            {rows[0].map((brailleCode, subIndex) => (
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
        ) : (
          rows.map((row, index) => (
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
          ))
        )}
        <div
          style={{
            position: "absolute",
            bottom: "-85px",
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

  const checkAnswer = (answer) => {
  if (!answer) return;  // 빈 입력일 경우 무시

  const currentChar = brailleList[currentIndex];
  let message = "";

  if (answer === currentChar) {
    if (!correctChars.includes(currentChar)) {
      setCorrectAnswers((prev) => Math.min(prev + 1, 16));
      setAccuracy((prevAccuracy) => Math.min(100, prevAccuracy + 6.25));
      setCorrectChars((prev) => [...prev, currentChar]);
    }
    message = "정답입니다!";
  } else {
    if (!correctChars.includes(currentChar)) {
      setAccuracy((prevAccuracy) => Math.max(0, prevAccuracy - 6.25));
    }
    message = "오답입니다.";
  }

  setFeedback(message);

  const utterance = new SpeechSynthesisUtterance(message);
  utterance.lang = "ko-KR";
  speechSynthesis.speak(utterance);
};


  const startSTT = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("브라우저가 음성 인식을 지원하지 않습니다.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

     recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.trim();
  const matchedChar = pronunciationMap[transcript];

  const answerToCheck = matchedChar || transcript;

  setUserAnswer(answerToCheck);
  checkAnswer(answerToCheck);  // 항상 checkAnswer 호출
};



      recognition.onerror = (event) => {
        console.error("STT 오류:", event.error);
        alert("음성 인식 중 오류가 발생했습니다.");
      };

      recognitionRef.current = recognition;
    }

    recognitionRef.current.start();
  };

  const handleSubmitLearningResults = async () => {
    try {
      const data = {
        accuracy: accuracy.toFixed(2),
        progress: correctAnswers,
      };

      const response = await axios.post("http://192.168.0.2:8000/accountapp/submit-results/", data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("학습 결과가 성공적으로 전송되었습니다!");
      } else {
        alert("학습 결과 전송에 실패했습니다.");
      }
    } catch (error) {
      console.error("학습 결과 전송 오류:", error);
      alert("학습 결과 전송 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ position: "absolute", top: "20px", left: "20px", cursor: "pointer" }} onClick={() => navigate("/")}>
        <img src={logo} alt="Logo" style={{ height: "50px", width: "auto" }} />
      </div>

      <div style={{ marginTop: "60px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px" }}>
          <FaStar
            size={24}
            onClick={toggleFavorite}
            color={isFavorited ? "gold" : "gray"}
            style={{ cursor: "pointer" }}
          />
          <FaUser
            size={24}
            onClick={() => alert("마이페이지 이동")}
            style={{ cursor: "pointer" }}
          />
        </div>

        <h1>점자 퀴즈</h1>

        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "40px",
          padding: "0 20%",
        }}>
          <div style={{
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
          }}>
            {question}
            <FaArrowLeft size={40} onClick={prevQuestion} style={{ position: "absolute", bottom: "-70px", left: "0", cursor: "pointer" }} />
            <FaArrowRight size={40} onClick={nextQuestion} style={{ position: "absolute", bottom: "-70px", right: "0", cursor: "pointer" }} />
          </div>

          <div style={{ fontSize: "48px", fontWeight: "bold" }}>→</div>

          <div style={{
            marginTop: "50px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "50px",
            width: "350px",
            height: "350px",
          }}>
            {renderBrailleBlocks(braillePattern)}
          </div>
        </div>

        <div style={{ marginTop: "100px" }}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="점자에 해당하는 글자를 입력하세요"
            style={{
              padding: "11px",
              fontSize: "18px",
              height: "23px",
              width: "300px",
              borderRadius: "5px",
              border: "1px solid #ccc",
              marginRight: "10px",
            }}
          />
          <button
            onClick={() => checkAnswer(userAnswer.trim())}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px",
            }}
          >
            확인
          </button>
          <button
            onClick={startSTT}
            style={{
              padding: "10px 20px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#17a2b8",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
              marginTop: "10px",
              marginLeft: "10px",
            }}
          >
            음성 입력
          </button>
        </div>

        <div style={{ marginTop: "10px", fontSize: "20px", color: feedback === "정답입니다!" ? "green" : "red", height: "28px" }}>
  {feedback}
</div>


        <div style={{
          position: "absolute",
          right: "78%",
          top: "45%",
          fontSize: "50px",
          fontWeight: "bold",
          color: "black",
          marginRight: "15px",
        }}>
          정확도: {accuracy.toFixed(2)}%
        </div>

        <div style={{
          position: "absolute",
          right: "78%",
          top: "70%",
          fontSize: "50px",
          fontWeight: "bold",
          color: "black",
          marginRight: "15px",
        }}>
          학습 진행률: {correctAnswers}/16
        </div>

        <div style={{ marginTop: "60px" }}>
          <button
            onClick={handleSubmitLearningResults}
            style={{
              padding: "12px 30px",
              fontSize: "18px",
              fontWeight: "bold",
              backgroundColor: "#dc3545",
              color: "white",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            학습 종료
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chosungquiz;
