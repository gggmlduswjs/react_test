import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaVolumeUp } from 'react-icons/fa';
import logo from './images/logo.png';

function Camera() {
  const navigate = useNavigate();
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [brailleResult, setBrailleResult] = useState('');
  const [brailleInfo, setBrailleInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sendingText, setSendingText] = useState(false);

  const handleImageCapture = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCapturedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageSubmit = async () => {
    if (!capturedFile) {
      alert('먼저 이미지를 촬영해주세요.');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('image', capturedFile);

    try {
      const response = await fetch('http://192.168.0.2:8000/accountapp/upload-image/', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        setBrailleResult(data.captions || '점자 해석 결과 없음');
        setBrailleInfo(null); // 초기화
        alert('이미지 분석 완료!');
      } else {
        throw new Error(`서버 오류 (상태 코드: ${response.status})`);
      }
    } catch (error) {
      alert(`전송 실패: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCaptionSubmit = async () => {
    if (!brailleResult) {
      alert('전송할 텍스트가 없습니다.');
      return;
    }

    setSendingText(true);

    const formData = new FormData();
    formData.append('converted_text', brailleResult);

    try {
      const response = await fetch('http://192.168.0.2:8000/accountapp/text-only/', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
        setBrailleInfo(data);
        alert('텍스트 전송 및 점자 변환 완료!');
      } else {
        throw new Error('점자 변환 실패');
      }
    } catch (error) {
      alert(`전송 실패: ${error.message}`);
    } finally {
      setSendingText(false);
    }
  };

  const speakResult = () => {
    if (brailleResult) {
      const utterance = new SpeechSynthesisUtterance(brailleResult);
      utterance.lang = 'ko-KR';
      speechSynthesis.speak(utterance);
    }
  };

  // 점자 배열(1차원 6개짜리)을 3행 2열로 변환
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

  const renderBrailleBlocks = (brailleInfo) => {
    if (!brailleInfo || !Array.isArray(brailleInfo)) return null;

    return (
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          padding: '10px',
        }}
      >
        {brailleInfo.map((charData, index) => (
          <div key={index} style={{ margin: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {convertMatrixToBrailleDots(charData.braille_matrix).map((brailleDots, i) => (
                <div key={i} style={{ marginRight: '15px' }}>
                  {brailleDots.map((row, j) => (
                    <div key={j} style={{ display: 'flex', justifyContent: 'center' }}>
                      {row.map((dot, k) => (
                        <span key={k} style={{ fontSize: '8px', margin: '5px' }}>
                          {dot === 1 ? '●' : '○'}
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

  // 아두이노 전송 버튼 클릭 핸들러 (예시)
// 아두이노 전송 버튼 클릭 핸들러 (10개씩 나눠서 순차 전송)
// 딜레이 함수
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const sendToArduino = async () => {
  if (!brailleInfo || !Array.isArray(brailleInfo) || brailleInfo.length === 0) {
    alert('전송할 점자 정보가 없습니다.');
    return;
  }

  const chunkSize = 5; // 10 → 5로 줄여서 데이터량 감소
  const delayMs = 300; // 청크 간 300ms 딜레이 (필요 시 조절)

  const chunks = [];
  for (let i = 0; i < brailleInfo.length; i += chunkSize) {
    chunks.push(brailleInfo.slice(i, i + chunkSize));
  }

  try {
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const response = await axios.post(
        'http://192.168.0.18:5000/braille',
        { matrix: chunk },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false,
        }
      );

      if (response.status !== 200) {
        alert(`청크 ${i + 1} 전송 실패`);
        return;
      }

      // 딜레이 추가
      await sleep(delayMs);
    }
    alert('모든 점자 데이터가 성공적으로 출력되었습니다.');
  } catch (error) {
    console.error('전송 오류:', error);
    alert('전송 중 오류가 발생했습니다.');
  }
};


  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <div
        style={{ position: 'absolute', top: '20px', left: '20px', cursor: 'pointer' }}
        onClick={() => navigate('/')}
      >
        <img src={logo} alt="Logo" style={{ height: '50px', width: 'auto' }} />
      </div>

      <h1>BRAILLE</h1>
      <h2 style={{ color: '#009688' }}>이미지 → 결과 및 6점자 변환</h2>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', marginTop: '30px', gap: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '500px',
            height: '400px',
            border: '2px solid #ccc',
            borderRadius: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
            backgroundColor: '#fefefe',
            padding: '10px',
            boxSizing: 'border-box',
          }}>
            {previewImage ? (
              <img src={previewImage} alt="미리보기" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <span>촬영된 이미지 없음</span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <label htmlFor="fileInput" style={{
              padding: '10px 20px',
              backgroundColor: '#009688',
              color: 'white',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px',
            }}>
              사진 촬영
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleImageCapture}
            />
            <button
              onClick={handleImageSubmit}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: loading ? '#999' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px',
              }}
            >
              {loading ? '전송 중...' : '전송'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '500px',
            height: '400px',
            border: '2px solid #ccc',
            borderRadius: '10px',
            padding: '10px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#fefefe',
            boxSizing: 'border-box',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'center',
            wordBreak: 'break-word',
          }}>
            {brailleResult || '결과 대기 중...'}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={speakResult}
              disabled={!brailleResult}
              style={{
                padding: '10px 20px',
                backgroundColor: '#607D8B',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: brailleResult ? 'pointer' : 'not-allowed',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <FaVolumeUp />
              음성 출력
            </button>

            <button
              onClick={handleCaptionSubmit}
              disabled={!brailleResult || sendingText}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3F51B5',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: brailleResult ? 'pointer' : 'not-allowed',
                fontSize: '16px',
              }}
            >
              {sendingText ? '변환 중...' : '텍스트 전송'}
            </button>
          </div>
        </div>
      </div>

      {/* ✅ 점자 블록 출력 */}
      <div
        style={{
          marginTop: '40px',
          padding: '30px',
          border: '1px solid #009688',
          borderRadius: '10px',
          backgroundColor: '#f9f9f9',
          width: '80%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      >
        <h3 style={{ color: '#009688' }}>6점자 표현</h3>
        {sendingText ? (
          <p style={{ color: '#777' }}>점자 데이터를 불러오는 중...</p>
        ) : brailleInfo ? (
          renderBrailleBlocks(brailleInfo)
        ) : (
          <p style={{ color: '#aaa' }}>점자 변환 결과가 여기에 표시됩니다.</p>
        )}
      </div>

      {/* 아두이노 전송 버튼 (점자 박스 아래 고정) */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button
          onClick={sendToArduino}
          style={{
            padding: '12px 30px',
            backgroundColor: '#009688',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
          }}
        >
          출력
        </button>
      </div>
    </div>
  );
}

export default Camera;
