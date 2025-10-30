import CircularText from './CircularText';
import blacktapeLogo from '@/assets/blacktape-logo.svg';
import './LoadingScreen.css';

const LoadingScreen = ({ isLoading = true }) => {
  if (!isLoading) return null;

  return (
    <div className="loading-screen">
      <div className="loading-container">
        <CircularText
          text="BLACKTAPE*LOADING*CONNECTA*"
          spinDuration={15}
          onHover={null}
          className="loading-circular-text"
        />
        <div className="loading-logo">
          <img src={blacktapeLogo} alt="Blacktape Logo" />
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
