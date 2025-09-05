import { CameraView } from '@/components/CameraView';
import { Hand, Zap } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-primary rounded-xl glow-effect">
              <Hand className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gradient">
              GestureText AI
            </h1>
            <div className="p-3 bg-gradient-tech rounded-xl tech-shadow">
              <Zap className="h-8 w-8 text-accent-foreground" />
            </div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert hand gestures into text in real-time using AI-powered computer vision
          </p>
        </header>

        {/* Main Content */}
        <main className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <CameraView />
        </main>

        {/* Footer */}
        <footer className="text-center mt-12 text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <p>Position your hand clearly in front of the camera for best results</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
