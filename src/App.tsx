import GitCodeViewer from './components/GitCodeViewer';
import PrivacyKitDemo from './components/PrivacyKitDemo';

function App() {
  return (
    <>
      <div style={{ margin: '1rem 0' }}>
        <GitCodeViewer title="HTML" repo="privacykit-eu/privacykit-demo" path="master/index.html" lang="html" height="400px" />
      </div>
      <PrivacyKitDemo />
      <div style={{ margin: '1rem 0' }}>
        <GitCodeViewer title="React" repo="privacykit-eu/privacykit-demo" path="master/src/App.tsx" lang="tsx" height="400px" />
      </div>
    </>
  );
}

export default App;
