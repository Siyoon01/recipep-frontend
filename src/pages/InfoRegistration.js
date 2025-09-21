/* 비로그인 상태의 정보 등록 페이지 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './InfoRegistration.css';
import Stage from '../components/Stage';

function InfoRegistration() {
  const [allergyInput, setAllergyInput] = useState('');
  const [allergyTags, setAllergyTags] = useState([]);
  const [selectedTools, setSelectedTools] = useState([]);

  const navigate = useNavigate();

  const cookingTools = [
    '웍', '전자레인지', '큰 냄비', '뚝배기', 
    '오븐', '작은 냄비', '후라이팬', '에어프라이기'
  ];

  const handleAllergyKeyPress = (e) => {
    if (e.key === 'Enter' && allergyInput.trim()) {
      if (!allergyTags.includes(allergyInput.trim())) {
        setAllergyTags([...allergyTags, allergyInput.trim()]);
      }
      setAllergyInput('');
    }
  };

  const removeAllergyTag = (tagToRemove) => {
    setAllergyTags(allergyTags.filter(tag => tag !== tagToRemove));
  };

  const handleToolClick = (tool) => {
    if (selectedTools.includes(tool)) {
      setSelectedTools(selectedTools.filter(t => t !== tool));
    } else {
      setSelectedTools([...selectedTools, tool]);
    }
  };

  const handleSubmit = async () => {
    console.log('알레르기:', allergyTags);
    console.log('선택된 조리도구:', selectedTools);
    
    try {
      // JWT 토큰 확인
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        navigate('/Userlogin');
        return;
      }

      // 조리도구를 백엔드 형식으로 변환
      const toolsObject = {};
      cookingTools.forEach(tool => {
        toolsObject[tool] = selectedTools.includes(tool);
      });

      const response = await fetch('http://localhost:3001/api/user/detailinfo', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          allergies: allergyTags,
          tools: toolsObject,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('정보 등록 성공:', data);
        alert('정보가 성공적으로 등록되었습니다!');
        // 다음 단계(재료 등록 페이지)로 이동
        navigate('/ingredient-registration');
      } else {
        const errorData = await response.json();
        console.error('정보 등록 실패:', errorData);
        alert('정보 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('API 호출 중 오류:', error);
      alert('서버와 연결할 수 없습니다.');
    }
  };

  return (
    <div className="info-registration-container">
      <Stage currentstage={2} />
      
      <div className="info-registration-content">
        <div className="form-section">
          <h2 className="section-title">정보 등록</h2>
          
          <div className="allergy-section">
            <label className="allergy-label">알레르기</label>
            <div className="allergy-input-container">
              <input
                type="text"
                placeholder="엔터로 입력해주세요"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyPress={handleAllergyKeyPress}
                className="allergy-input"
              />
            </div>
            {allergyTags.length > 0 && (
              <div className="allergy-tags">
                {allergyTags.map((tag, index) => (
                  <div key={index} className="allergy-tag">
                    {tag}
                    <button 
                      className="tag-remove-btn"
                      onClick={() => removeAllergyTag(tag)}
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="tools-section">
            <label className="tools-label">조리도구</label>
            <div className="tools-grid">
              {cookingTools.map((tool) => (
                <button
                  key={tool}
                  className={`tool-btn ${
                    selectedTools.includes(tool) ? 'selected' : ''
                  }`}
                  onClick={() => handleToolClick(tool)}
                >
                  {tool}
                </button>
              ))}
            </div>
          </div>

          <button className="submit-btn" onClick={handleSubmit}>
            정보 등록 완료
          </button>
        </div>
      </div>
    </div>
  );
}

export default InfoRegistration;