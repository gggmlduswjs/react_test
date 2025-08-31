import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './images/logo.png';

function FileUploads() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [text, setText] = useState('');
  const [brailleInfo, setBrailleInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setText('');
      setBrailleInfo(null);
    } else {
      alert('PDF 파일만 업로드 가능합니다.');
      setFile(null);
    }
  };

  const handleFileDelete = () => {
    setFile(null);
    setText('');
    setBrailleInfo(null);
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
  };

  const handleSendToServer = async () => {
    if (!file) {
      alert('PDF 파일을 먼저 선택하세요.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('pdf_file', file);

    try {
      await axios.post('http://192.168.0.2:8000/accountapp/upload-pdf/', formData);
      alert('PDF 전송 완료. 텍스트를 가져옵니다.');
      await handleFetchText();
    } catch (error) {
      console.error('PDF 전송 오류:', error);
      alert('서버 전송 실패.');
    }
    setLoading(false);
  };

  const handleFetchText = async () => {
    try {
      const response = await axios.get('http://192.168.0.2:8000/accountapp/converted_texts/', {
        params: { name: '정현종' },
      });

      const extractedText = response.data.text;
      setText(extractedText);
      alert('텍스트 수신 성공. 점자 변환을 시작합니다.');
      await convertTextToBraille(extractedText);
    } catch (error) {
      console.error('텍스트 가져오기 오류:', error);
      alert('텍스트 수신 실패.');
    }
  };

  const convertTextToBraille = async (textData) => {
    if (!textData) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('converted_text', textData);

    try {
      const response = await axios.post('http://192.168.0.2:8000/accountapp/text-only/', formData);
      if (response.data && Array.isArray(response.data)) {
        setBrailleInfo(response.data);
      } else {
        alert('점자 데이터 없음.');
      }
    } catch (error) {
      console.error('점자 변환 오류:', error);
      alert('점자 변환 실패.');
    }
    setLoading(false);
  };

  const convertMatrixToBrailleDots = (matrixList) => {
    if (!Array.isArray(matrixList)) return [];

    return matrixList.map((matrix) => {
      if (!Array.isArray(matrix) || matrix.length !== 6) return null;

      return [
        [matrix[0], matrix[3]],
        [matrix[1], matrix[4]],
        [matrix[2], matrix[5]],
      ];
    }).filter(Boolean);
  };

  const renderBrailleBlocks = () => {
    if (!brailleInfo) return null;

    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {brailleInfo.map((charData, index) => (
          <div key={index} style={{ margin: '10px' }}>
            {convertMatrixToBrailleDots(charData.braille_matrix).map((brailleDots, i) => (
              <div key={i}>
                {brailleDots.map((row, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: 'center' }}>
                    {row.map((dot, k) => (
                      <span key={k} style={{ fontSize: '24px', margin: '2px' }}>
                        {dot === 1 ? '●' : '○'}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  const sendToArduino = async () => {
    if (!brailleInfo) {
      alert('전송할 점자 정보가 없습니다.');
      return;
    }

    try {
      const response = await axios.post('http://192.168.0.19:5000/braille', {
        matrix: brailleInfo,
      }, {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: false,
      });

      if (response.status === 200) {
        alert('하드웨어 전송 성공');
      } else {
        alert('하드웨어 전송 실패');
      }
    } catch (error) {
      console.error('하드웨어 전송 오류:', error);
      alert('전송 중 오류 발생.');
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ position: 'absolute', top: '20px', left: '20px', cursor: 'pointer' }} onClick={() => navigate('/')}>
        <img src={logo} alt="Logo" style={{ height: '50px', width: 'auto' }} />
      </div>

      <h1>BRAILLE</h1>
      <h2 style={{ color: '#009688' }}>PDF → 점자 변환</h2>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '50px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>업로드된 PDF</h3>
          {file ? (
            <p>{file.name}</p>
          ) : (
            <div style={{ width: '200px', height: '200px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              PDF 없음
            </div>
          )}
          <input id="file-input" type="file" accept="application/pdf" onChange={handleFileChange} style={{ marginTop: '20px' }} />
          <button onClick={handleFileDelete} style={{ marginTop: '10px' }}>파일 삭제</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <h3>추출된 텍스트</h3>
          <div style={{ width: '200px', height: '200px', backgroundColor: '#f0f0f0', overflow: 'auto', padding: '10px' }}>
            {loading ? '로딩 중...' : text || '텍스트 없음'}
          </div>
        </div>
      </div>

      <button onClick={handleSendToServer} disabled={loading} style={{ marginTop: '40px', width: '100px', height: '50px', borderRadius: '50px' }}>
        {loading ? '전송 중...' : '전송'}
      </button>

      <div style={{ marginTop: '40px', padding: '30px', border: '1px solid #009688', borderRadius: '10px', backgroundColor: '#f9f9f9' }}>
        <h3 style={{ color: '#009688' }}>6점자 표현</h3>
        {loading ? <p>점자 데이터를 로딩 중...</p> : renderBrailleBlocks()}
      </div>

      <div style={{ marginTop: '30px' }}>
        <button onClick={sendToArduino} style={{ padding: '12px 24px', fontSize: '16px', backgroundColor: '#009688', color: 'white', border: 'none', borderRadius: '8px' }}>
          출력
        </button>
      </div>
    </div>
  );
}

export default FileUploads;
