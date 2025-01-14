import styled from 'styled-components';

export const Form = styled.form`
  max-width: 400px;
  height: 180px;
  margin: 12px auto 8px auto;
`;

export const Fieldset = styled.fieldset`
  display: flex;
  flex-direction: column;
  height: 180px;
  justify-content: space-evenly;
  border: none;

  & label {
    margin-right: 10px;
  }

  :disabled {
    & label {
      color: gray;
    }
  }
`;
