import {
  TopBar,
  ContextHeader,
  WorkspaceLayout,
  PrimaryWorkspace,
  SecondaryPanel,
  ProofFooter,
} from './components/layout';
import { Card, Button, Input, ErrorState, EmptyState } from './components/base';
import './styles/globals.css';
import './App.css';

function App() {
  const handleCopy = () => {
    console.log('Copy clicked');
  };

  const handleBuildInLovable = () => {
    console.log('Build in Lovable clicked');
  };

  const handleItWorked = () => {
    console.log('It Worked clicked');
  };

  const handleError = () => {
    console.log('Error clicked');
  };

  const handleAddScreenshot = () => {
    console.log('Add Screenshot clicked');
  };

  return (
    <>
      <TopBar
        projectName="KodNest Premium Build System"
        currentStep={1}
        totalSteps={5}
        status="In Progress"
      />
      
      <ContextHeader
        headline="Design System Demo"
        subtext="A calm, intentional, and coherent design system for professional products."
      />
      
      <WorkspaceLayout>
        <PrimaryWorkspace>
          <div className="demo-content">
            <section className="demo-section">
              <h2>Component Showcase</h2>
              <p className="demo-description">
                This is a demonstration of the KodNest Premium Build System. Every component
                follows strict design principles: no gradients, no glassmorphism, no animation
                noise. Just calm, confident design.
              </p>
            </section>

            <section className="demo-section">
              <h3>Cards</h3>
              <div className="demo-grid">
                <Card padding="md">
                  <h3>Card Title</h3>
                  <p>This is a clean card with subtle borders and balanced padding. No shadows, no noise.</p>
                </Card>
                <Card padding="md">
                  <h3>Another Card</h3>
                  <p>Consistent spacing and typography across all components.</p>
                </Card>
              </div>
            </section>

            <section className="demo-section">
              <h3>Form Elements</h3>
              <div className="demo-form">
                <Input
                  label="Project Name"
                  placeholder="Enter project name"
                  defaultValue="My Project"
                />
                <Input
                  label="Description"
                  placeholder="Enter description"
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  error="This field is required. Please enter a valid email address."
                />
              </div>
            </section>

            <section className="demo-section">
              <h3>Actions</h3>
              <div className="demo-buttons">
                <Button variant="primary">Primary Action</Button>
                <Button variant="secondary">Secondary Action</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
            </section>

            <section className="demo-section">
              <h3>Empty State</h3>
              <Card padding="lg">
                <EmptyState
                  title="No projects yet"
                  description="Get started by creating your first build. It only takes a moment."
                  actionLabel="Create First Project"
                  onAction={() => console.log('Create project')}
                />
              </Card>
            </section>

            <section className="demo-section">
              <h3>Error State</h3>
              <Card padding="lg">
                <ErrorState
                  title="Build failed"
                  description="The deployment process encountered an unexpected error during the build step."
                  suggestion="Check your build configuration and try again. If the issue persists, review the error logs."
                  onRetry={() => console.log('Retry')}
                />
              </Card>
            </section>
          </div>
        </PrimaryWorkspace>

        <SecondaryPanel
          title="Step Instructions"
          explanation="Follow these instructions to complete the current step. Everything is designed to be clear and actionable."
          prompt="npm install @kodnest/premium-build-system"
          onCopy={handleCopy}
          onBuildInLovable={handleBuildInLovable}
          onItWorked={handleItWorked}
          onError={handleError}
          onAddScreenshot={handleAddScreenshot}
        />
      </WorkspaceLayout>

      <ProofFooter />
    </>
  );
}

export default App;
