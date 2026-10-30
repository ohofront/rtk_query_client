import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  useTodoListQuery,
  useTodoAddMutation,
  useTodoToggleMutation,
  useTodoRemoveMutation,
} from '../module/addApi';

const TodoList = () => {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');

  // RTK Query 훅 연동
  const { data: todoList = [], isLoading, isError, refetch } = useTodoListQuery();
  const [addTodo, { isLoading: isAdding }] = useTodoAddMutation();
  const [toggleTodo] = useTodoToggleMutation();
  const [removeTodo] = useTodoRemoveMutation();

  const handleCreate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isAdding) return;

    try {
      await addTodo({ description: trimmed }).unwrap();
      setInputValue('');
    } catch (err) {
      console.error('할 일 추가 중 오류 발생:', err);
    }
  };

  const handleToggle = async (id: number, currentCompleted?: boolean) => {
    try {
      await toggleTodo({ id, completed: !currentCompleted }).unwrap();
    } catch (err) {
      console.error('할 일 상태 변경 중 오류 발생:', err);
    }
  };

  const handleRemove = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await removeTodo(id).unwrap();
    } catch (err) {
      console.error('할 일 삭제 중 오류 발생:', err);
    }
  };

  return (
    <Container>
      <BackButton onClick={() => navigate('/')}>← 홈으로 돌아가기</BackButton>

      <TodoListTemplate>
        <Title>
          To Do List
          {!process.env.REACT_APP_API_BASE_URL && (
            <Badge>LocalStorage Mock Mode</Badge>
          )}
        </Title>

        <FormWrapper onSubmit={handleCreate}>
          <StyledInput
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="할 일을 적어주세요 (Enter로 등록)"
            disabled={isAdding}
          />
          <AddButton
            type="submit"
            disabled={!inputValue.trim() || isAdding}
          >
            {isAdding ? '추가 중...' : '추가'}
          </AddButton>
        </FormWrapper>

        <TodoWrapper>
          {isLoading ? (
            <StatusMessage>할 일 목록을 불러오는 중입니다...</StatusMessage>
          ) : isError ? (
            <StatusMessage>
              목록을 불러오지 못했습니다.{' '}
              <RetryButton onClick={() => refetch()}>다시 시도</RetryButton>
            </StatusMessage>
          ) : todoList.length === 0 ? (
            <StatusMessage>등록된 할 일이 없습니다. 새로운 할 일을 추가해보세요!</StatusMessage>
          ) : (
            todoList.map((item) => (
              <TodoItem key={item.id} onClick={() => handleToggle(item.id, item.completed)}>
                <Remove
                  className="remove-btn"
                  onClick={(e) => handleRemove(e, item.id)}
                  title="삭제"
                >
                  ✕
                </Remove>
                <Checked checked={Boolean(item.completed)}>
                  <Text>{item.description}</Text>
                </Checked>
                {item.completed && <CheckMark>✓</CheckMark>}
              </TodoItem>
            ))
          )}
        </TodoWrapper>
      </TodoListTemplate>
    </Container>
  );
};

const Container = styled.div`
  max-width: 540px;
  margin: 3rem auto;
  padding: 0 1rem;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #22b8cf;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.75;
  }
`;

const TodoListTemplate = styled.div`
  background: white;
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08);
`;

const Title = styled.div`
  padding: 1.75rem 2rem 1.25rem;
  font-size: 2.2rem;
  text-align: center;
  font-weight: 300;
  background: #22b8cf;
  color: white;
  letter-spacing: 1px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const Badge = styled.span`
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.25);
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  letter-spacing: 0;
`;

const FormWrapper = styled.form`
  display: flex;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e9ecef;
  background: #fafbfc;
`;

const StyledInput = styled.input`
  flex: 1;
  font-size: 1.1rem;
  outline: none;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.15s ease;

  &:focus {
    border-color: #22b8cf;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const AddButton = styled.button`
  padding: 0.5rem 1.25rem;
  margin-left: 0.75rem;
  background: #22b8cf;
  border: none;
  border-radius: 4px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, opacity 0.15s ease;

  &:hover:not(:disabled) {
    background: #15aabf;
  }

  &:disabled {
    background: #ced4da;
    cursor: not-allowed;
  }
`;

const TodoWrapper = styled.div`
  min-height: 8rem;
  max-height: 520px;
  overflow-y: auto;
`;

const StatusMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: #868e96;
  font-size: 0.95rem;
`;

const RetryButton = styled.button`
  margin-left: 0.5rem;
  background: #22b8cf;
  color: white;
  border: none;
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.85rem;
`;

const TodoItem = styled.div`
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f1f3f5;
  cursor: pointer;
  transition: background 0.15s ease;
  user-select: none;

  &:hover {
    background: #f8f9fa;
  }

  &:hover .remove-btn {
    opacity: 1;
  }
`;

const Remove = styled.span`
  margin-right: 0.75rem;
  color: #ff6b6b;
  font-size: 1.1rem;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease;
  padding: 0 0.25rem;

  &:hover {
    color: #e03131;
  }
`;

type CheckedProps = {
  checked: boolean;
};

const Checked = styled.div<CheckedProps>`
  flex: 1;
  color: ${({ checked }) => (checked ? '#adb5bd' : '#343a40')};
  text-decoration: ${({ checked }) => (checked ? 'line-through' : 'none')};
  transition: color 0.15s ease;
`;

const Text = styled.div`
  word-break: break-all;
  font-size: 1.05rem;
  line-height: 1.4;
`;

const CheckMark = styled.div`
  font-size: 1.3rem;
  margin-left: 0.75rem;
  color: #22b8cf;
  font-weight: 800;
`;

export default TodoList;
