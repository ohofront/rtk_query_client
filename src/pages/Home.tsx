import { useNavigate } from 'react-router-dom';
import { darken, lighten } from 'polished';
import styled from 'styled-components';

const Home = () => {
  const navigate = useNavigate();

  return (
    <MainWrapper>
      <Card>
        <Title>RTK Query Todo App</Title>
        <Description>
          Redux Toolkit Query와 TypeScript로 구축된 스마트한 할 일 관리 애플리케이션입니다.
        </Description>
        <StyledButton onClick={() => navigate('/todo')}>
          할 일 만들러 가기 →
        </StyledButton>
      </Card>
    </MainWrapper>
  );
};

const MainWrapper = styled.div`
  display: flex;
  margin-top: 8rem;
  height: 100%;
  align-items: center;
  justify-content: center;
  padding: 0 1rem;
`;

const Card = styled.div`
  background: white;
  width: 100%;
  max-width: 480px;
  padding: 3rem 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08), 0 2px 4px rgba(0, 0, 0, 0.06);
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 1rem;
`;

const Description = styled.p`
  font-size: 1rem;
  color: #868e96;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const StyledButton = styled.button`
  padding: 0.875rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  background: #22b8cf;
  border-radius: 8px;
  border: none;
  color: white;
  cursor: pointer;
  transition: background 0.15s ease-in-out, transform 0.1s ease;

  &:hover {
    background: ${lighten(0.08, '#22b8cf')};
  }

  &:active {
    background: ${darken(0.08, '#22b8cf')};
    transform: scale(0.98);
  }
`;

export default Home;
