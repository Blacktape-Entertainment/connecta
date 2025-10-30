import './Footer.css';

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="footer-gradient-line"></div>
      <div className="footer-content">
        <div className="footer-text">
          <span className="footer-copyright">© 2025 Connecta - Cairo ICT</span>
          <span className="footer-separator">•</span>
          {/* TODO: Add our blacktape font here */}
          <span className="footer-attribution">
            Developed By{' '}
            <a 
              href="https://blacktape.ai" 
              target="_blank" 
              rel="noopener noreferrer"
              className="footer-link"
            >
              Blacktape.ai
            </a>
          </span>
        </div>
        <div className="footer-glow"></div>
      </div>
    </footer>
  );
};

export default Footer;
