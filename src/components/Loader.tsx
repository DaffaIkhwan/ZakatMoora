import styled, { keyframes } from 'styled-components';

interface LoaderProps {
    isDark?: boolean;
    overlay?: boolean;
}

const Loader = ({ isDark = false, overlay = false }: LoaderProps) => {
    return (
        <LoaderContainer $overlay={overlay} $isDark={isDark}>
            <SpinnerWrapper>
                <GreenSpinner viewBox="0 0 50 50">
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="4"
                    />
                    <GreenArc
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                </GreenSpinner>
                <LoadingText>Memuat data...</LoadingText>
            </SpinnerWrapper>
        </LoaderContainer>
    );
};

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

interface ContainerProps {
    $overlay: boolean;
    $isDark: boolean;
}

const LoaderContainer = styled.div<ContainerProps>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: ${props => props.$overlay ? '100vh' : '100%'};
  width: ${props => props.$overlay ? '100vw' : '100%'};
  background: ${props => {
        if (props.$overlay) {
            return 'rgba(15, 23, 42, 0.75)';
        }
        return props.$isDark
            ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'
            : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)';
    }};
  position: ${props => props.$overlay ? 'fixed' : 'relative'};
  top: 0;
  left: 0;
  z-index: ${props => props.$overlay ? 9999 : 1};
  backdrop-filter: ${props => props.$overlay ? 'blur(6px)' : 'none'};
`;

const SpinnerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
`;

const GreenSpinner = styled.svg`
  width: 48px;
  height: 48px;
  animation: ${spin} 0.8s linear infinite;
`;

const GreenArc = styled.circle`
  stroke: #22c55e;
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
`;

const LoadingText = styled.span`
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  animation: ${pulse} 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
`;

export default Loader;
