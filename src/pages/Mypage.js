import React from 'react';
import { useState, useEffect } from 'react';
import './Mypage.css';

function Mypage() {
  const [basicInfo, setBasicInfo] = useState({
    nickname: '',
    username: '',
    password: '',
  });

  // 알레르기 상태와 입력창 상태
  const [allergyInput, setAllergyInput] = useState('');
  const [allergies, setAllergies] = useState([]);

  // 조리도구 선택 상태 (DB에서 불러온 값으로 초기화될 예정)
  const [tools, setTools] = useState({
    wok: false,
    microwave: false,
    bigPot: false,
    oven: false,
    smallPot: false,
    fryer: false,
  });

  // DB에서 사용자 정보 불러오기
  useEffect(() => {
    //API 호출
    const fetchUserInfo = async () => {
      try {
        // localStorage에서 JWT 토큰 가져오기
        const token = localStorage.getItem('token');
        if (!token) {
          alert('로그인이 필요합니다.');
          window.location.href = '/login';
          return;
        }

        // API 호출 - 백엔드의 /api/profile 엔드포인트 사용
        const response = await fetch('http://localhost:3001/api/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`, // JWT 토큰 추가
          },
        });

        if (!response.ok) {
          throw new Error('사용자 정보를 불러오는데 실패했습니다.');
        }

        const dataFromDb = await response.json(); // 서버로부터 받은 JSON 데이터

        // 백엔드에서 받은 사용자 정보로 상태 업데이트
        if (dataFromDb.success && dataFromDb.user) {
          setBasicInfo({
            nickname: dataFromDb.user.nickname,
            username: dataFromDb.user.username,
            password: '', // 보안상 비밀번호는 빈 문자열로 설정
          });
          // 알레르기와 조리도구는 현재 DB에 없으므로 기본값 사용
          setAllergies([]);
          setTools({ wok: false, microwave: false, bigPot: false, oven: false, smallPot: false, fryer: false });
        } else {
          throw new Error('사용자 정보 형식이 올바르지 않습니다.');
        }
      } catch (error) {
        console.error('사용자 정보를 불러오는 중 오류 발생:', error);
        alert('사용자 정보를 불러오는데 실패했습니다.');
        // 에러 발생 시 기본값으로 초기화
        setBasicInfo({ nickname: '', username: '', password: '' });
        setAllergies([]);
        setTools({ wok: false, microwave: false, bigPot: false, oven: false, smallPot: false, fryer: false });
      }
    };

    fetchUserInfo();
  }, []); // 빈 배열을 두어 컴포넌트가 처음 마운트될 때만 실행되도록 함

  // 기본 정보 입력값 변경 핸들러
  const handleBasicChange = (e) => {
    const { name, value } = e.target;
    setBasicInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 알레르기 입력 텍스트 변경 핸들러
  const handleAllergyInputChange = (e) => {
    setAllergyInput(e.target.value);
  };

  // 알레르기 태그 추가 (엔터 키 입력 시)
  const handleAllergyKeyDown = (e) => {
    if (e.key === 'Enter' && e.nativeEvent.isComposing === false && allergyInput.trim() !== '') {
      if (!allergies.includes(allergyInput.trim())) {
        setAllergies([...allergies, allergyInput.trim()]);
      }
      setAllergyInput(''); // 입력창 초기화
      e.preventDefault(); // 폼 제출 방지
    }
  };

  // 알레르기 태그 제거
  const removeAllergyTag = (tagToRemove) => {
    setAllergies(allergies.filter((tag) => tag !== tagToRemove));
  };

  // 조리도구 선택 토글 핸들러
  const toggleTool = (toolName) => {
    setTools((prev) => ({
      ...prev,
      [toolName]: !prev[toolName]
    }));
  };

  // 폼 제출 핸들러 (기본 정보 수정)
  const handleBasicSubmit = async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침) 방지

    console.log('기본 정보 수정 제출 데이터:', basicInfo);

    try {
      // localStorage에서 JWT 토큰 가져오기
      const token = localStorage.getItem('token');
      if (!token) {
        alert('로그인이 필요합니다.');
        window.location.href = '/login';
        return;
      }

      // DB 업데이트 API 구현 - 백엔드의 /api/profile 엔드포인트 사용
      const response = await fetch('http://localhost:3001/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // JWT 토큰 추가
        },
        body: JSON.stringify({ // 서버로 보낼 데이터
          nickname: basicInfo.nickname,
          username: basicInfo.username,
          password: basicInfo.password || undefined, // 비밀번호가 입력되었을 경우에만 전송
        }),
      });

      if (!response.ok) {
        throw new Error('기본 정보 수정에 실패했습니다.');
      }
      const result = await response.json(); // 서버 응답 데이터
      console.log('기본 정보 수정 성공:', result);
      alert('기본 정보가 성공적으로 수정되었습니다!');

    } catch (error) {
      console.error('기본 정보 수정 중 오류 발생:', error);
      alert('기본 정보 수정에 실패했습니다.');
    }
  };

  // 폼 제출 핸들러 (상세 정보 수정)
  const handleDetailSubmit = async (e) => {
    e.preventDefault(); // 폼의 기본 제출 동작(새로고침) 방지

    const detailData = { allergies, tools };
    console.log('상세 정보 수정 제출 데이터:', detailData);

    // DB 업데이트 API 호출 구현
     try {
      const response = await fetch('http://localhost:3001/api/user/detailinfo', {
        method: 'PUT', // 또는 'PATCH'
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${AuthToken}`,
        },
        body: JSON.stringify(detailData),
      });

      if (!response.ok) {
        throw new Error('상세 정보 수정에 실패했습니다.');
      }

      const result = await response.json();
      console.log('상세 정보 수정 성공:', result);
      alert('상세 정보가 성공적으로 수정되었습니다!');

    } catch (error) {
      console.error('상세 정보 수정 중 오류 발생:', error);
      alert('상세 정보 수정에 실패했습니다.');
    }
  };

  // 모달 열림 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 탈퇴 비밀번호 입력 상태
  const [withdrawPassword, setWithdrawPassword] = useState('');

  // 모달 열기
  const openModal = () => setIsModalOpen(true);
  // 모달 닫기
  const closeModal = () => {
    setWithdrawPassword('');
    setIsModalOpen(false);
  };

  // 회원 탈퇴 실행 핸들러
  const handleWithdrawConfirm = async () => {
    if (!withdrawPassword) {
      alert('비밀번호를 입력해주세요.');
      return;
    }
    // API 호출로 탈퇴 처리
    console.log('탈퇴 비밀번호:', withdrawPassword);

     try {
      // API 호출로 탈퇴 처리
      const response = await fetch('http://localhost:3001/api/user/withdraw', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${AuthToken}`,
        },
        body: JSON.stringify({ password: withdrawPassword }), // 탈퇴 시 비밀번호 확인
      });

      if (!response.ok) {
        const errorData = await response.json(); // 서버에서 보낸 에러 메시지
        throw new Error(errorData.message || '회원 탈퇴에 실패했습니다.');
      }

      alert('회원 탈퇴가 성공적으로 처리되었습니다.');
      // 탈퇴 성공 후 비로그인 메인 페이지로 리디렉션
      window.location.href = '/home'; 
      closeModal();

    } catch (error) {
      console.error('회원 탈퇴 중 오류 발생:', error);
      alert(`회원 탈퇴에 실패했습니다: ${error.message}`);
    }
  };

  return (
    <div className='MypageContainer'>
      <section className="BasicUserContainer">
        <h2>회원 기본 정보 수정</h2>
        <form onSubmit={handleBasicSubmit}>
          <label>닉네임</label>
          <input name="nickname" value={basicInfo.nickname} onChange={handleBasicChange} />
          <label>아이디</label>
          <input name="username" value={basicInfo.username} onChange={handleBasicChange} />
          <label>비밀번호</label>
          <input
            name="password"
            type="password"
            value={basicInfo.password}
            onChange={handleBasicChange}
            />
          <button type="submit">수정 완료</button>
        </form>
      </section>
      <section className='DetailUserContainer'>
        <h2>회원 상세 정보 수정</h2>
        <form onSubmit={handleDetailSubmit}>
          <label>알레르기</label>
            <input
              type="text"
              placeholder="알레르기 입력 후 엔터"
              value={allergyInput}
              onChange={handleAllergyInputChange}
              onKeyDown={handleAllergyKeyDown}
            />
            <div className="allergy-tags">
              {allergies.map((tag) => (
              <span key={tag} className="allergy-tag">
              {tag} <button type="button" onClick={() => removeAllergyTag(tag)}>X</button>
            </span>
            ))}
            </div>
          <label>조리도구</label>
            <div className="tools">
            {/* Object.entries로 key(도구명)와 value(선택여부)를 동시에 가져옵니다. */}
            {Object.entries(tools).map(([toolKey, selected]) => (
              <button
                key={toolKey}
                className={`tool-button ${selected ? 'selected' : ''}`}
                onClick={() => toggleTool(toolKey)}
                type="button" // form 내부의 버튼은 기본적으로 submit 타입이므로 명시적으로 button 타입 지정
              >
              {/* toolKey에 따라 사용자에게 보여줄 텍스트를 결정합니다. */}
              {toolKey === 'wok' ? '웍' :
              toolKey === 'microwave' ? '전자레인지' :
              toolKey === 'bigPot' ? '큰 냄비' :
              toolKey === 'oven' ? '오븐' :
              toolKey === 'smallPot' ? '작은 냄비' :
              toolKey === 'fryer' ? '에어프라이어' : toolKey /* 만약 다른 이름이 있다면 그대로 보여줌 */}
              </button>
            ))}
            </div>
            <button type="submit">수정 완료</button>
        </form>
      </section>
      <button onClick={openModal} className="withdraw-btn">회원 탈퇴</button>
      {/* 탈퇴 모달 */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>회원 탈퇴를 원하시면 하단에 비밀번호를 입력해주세요.</h3>
            <input
              id="withdraw-password"
              type="password"
              value={withdrawPassword}
              onChange={(e) => setWithdrawPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
            />
             <button className="confirm-btn" onClick={handleWithdrawConfirm}>회원 탈퇴</button>
            <button className="cancel-btn" onClick={closeModal}>돌아가기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Mypage;