import React, {useState} from "react";
import './Login.css';
import Stage from "../components/Stage";
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async(e) => {
    e.preventDefault(); // 폼 제출 시 새로고침 방지

    console.log('로그인 시도:', {username, password});

    try {
    const res = await fetch('http://localhost:3001/api/login', { // 백엔드의 로그인 API 엔드포인트
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // 백엔드로 보낼 데이터 (키 값은 백엔드에서 예상하는 이름과 동일하게)
        userID: username, // 백엔드에서 'userID'로 받음
        userPW: password, // 백엔드에서 'userPW'로 받음
      }),
    });

    const data = await res.json(); // 백엔드의 응답 (JSON 형태)을 파싱

    if (res.ok) { // HTTP 상태 코드가 200번대 (200, 201 등) -> 성공
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      alert(data.message);
      navigate('/mypage'); // 올바른 라우트로 변경
    } else { // HTTP 상태 코드가 400, 500번대 -> 실패
      alert(data.message || '로그인 실패'); // 백엔드에서 보낸 실패 메시지 또는 기본 메시지
    }
  } catch (error) {
    console.error('로그인 API 호출 중 오류 발생:', error);
    alert('서버와 통신하는 중 문제가 발생했습니다. 네트워크를 확인해주세요.');
    }
  };

  return(
    <>
    <Stage currentstage={2} />
      <section className="logincontainer">
        <form onSubmit={handleLogin}>
            <label htmlFor="username">아이디</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              autoFocus
            />
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
            />
          <button type="submit" className="loginbutton">로그인</button>
        </form>
      </section>
    </>
  )

}
export default Login;