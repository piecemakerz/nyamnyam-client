import React  from 'react';
import styled  from '@emotion/native';
import SigninForm from '../components/SigninForm';

type SigninScreenProps = {
    title: string;
    email: string;
    password: string;
    handleEmailChange: (text: string) => void;
    handlePasswordChange: (text: string) => void;
    handleSignupPress: (text: string) => void;
}

export default function SigninScrren({ title, email, password, handleEmailChange, 
    handlePasswordChange, handleSignupPress }: SigninScreenProps){

    return (
        <SigninContainer>
            <Title>{title}</Title>

            <SigninForm
                email={email}
                password={password} 
                handleEmailChange={handleEmailChange}
                handlePasswordChange={handlePasswordChange}
                handleSignupPress={handleSignupPress}
            />
        </SigninContainer>
    )
}

const SigninContainer = styled.View`
    display:flex;
    justify-content: center;
    padding:0 15%;
`;

const Title = styled.Text`
    text-align: center;
    font-size: 20px;
    margin:10% 0;
    font-weight: bold;
`;

