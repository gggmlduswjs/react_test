import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./homepage";
import Learning from "./learning";
import Quizlearning from "./quizlearning";
import FileUploads from "./file-uploads";
import TextPage from "./text";
import Chosung from "./chosung";
import Chosungquiz from "./chosungquiz";
import Jungsung from "./jungsung";
import Jungsungquiz from "./jungsungquiz";
import Jongsung from "./jongsung";
import Jongsungquiz from "./jongsungquiz";
import Yakja from "./yakja";
import Yakjaquiz from "./yakjaquiz";
import Yakeo from "./yakeo";
import Yakeoquiz from "./yakeoquiz";
import Camera from "./camera";

const App = () => {
  const location = useLocation();

  // 페이지 이동 시 스크롤을 최상단으로 이동
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/quizlearning" element={<Quizlearning />} />
        <Route path="/file-uploads" element={<FileUploads />} />
        <Route path="/text" element={<TextPage />} />
        <Route path="/chosung" element={<Chosung />} />
        <Route path="/chosungquiz" element={<Chosungquiz />} />
        <Route path="/jungsung" element={<Jungsung />} />
        <Route path="/jungsungquiz" element={<Jungsungquiz />} />
        <Route path="/jongsung" element={<Jongsung />} />
        <Route path="/jongsungquiz" element={<Jongsungquiz />} />
        <Route path="/yakja" element={<Yakja />} />
        <Route path="/yakjaquiz" element={<Yakjaquiz />} />
        <Route path="/yakeo" element={<Yakeo />} />
        <Route path="/yakeoquiz" element={<Yakeoquiz />} />
        <Route path="/camera" element={<Camera />} />
      </Routes>
    </div>
  );
};

export default App;
