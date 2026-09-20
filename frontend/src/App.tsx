import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { RecruiterBanner } from './components/RecruiterBanner';
import { LandingPage } from './components/LandingPage';
import { AgentWorkspace } from './components/AgentWorkspace/AgentWorkspace';
import { DocumentList } from './components/KnowledgeBase/DocumentList';
import { AnalyticsView } from './components/Analytics/AnalyticsView';
import { ChatWindow } from './components/ChatWidget/ChatWindow';
import { FloatingWidget } from './components/ChatWidget/FloatingWidget';

type ViewMode = 'landing' | 'widget-demo' | 'agent' | 'knowledge' | 'analytics';

export function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden select-none sm:select-auto">
      {/* Recruiter 1-Click Interactive Banner */}
      <RecruiterBanner onNavigate={setCurrentView} currentView={currentView} />

      {/* Main Top Navigation */}
      <Navbar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content View Switcher */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {currentView === 'landing' && <LandingPage onNavigate={setCurrentView} />}

        {currentView === 'widget-demo' && (
          <div className="flex-1 flex flex-col items-center justify-center p-4 bg-slate-950">
            <div className="w-full max-w-xl h-[90%] max-h-[640px] shadow-2xl">
              <ChatWindow embedded={true} />
            </div>
          </div>
        )}

        {currentView === 'agent' && <AgentWorkspace />}

        {currentView === 'knowledge' && <DocumentList />}

        {currentView === 'analytics' && <AnalyticsView />}

        {/* Floating Customer Widget (rendered on non-widget-demo views) */}
        {currentView !== 'widget-demo' && <FloatingWidget />}
      </main>
    </div>
  );
}

export default App;
