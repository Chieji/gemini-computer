
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useCallback, useEffect, useState} from 'react';
import {GeneratedContent} from './components/GeneratedContent';
import {Icon} from './components/Icon';
import {ParametersPanel} from './components/ParametersPanel';
import {Window} from './components/Window';
import {APP_DEFINITIONS_CONFIG, INITIAL_MAX_HISTORY_LENGTH} from './constants';
import {streamAppContent} from './services/geminiService';
import {AppDefinition, InteractionData, UserProfile} from './types';

const DesktopView: React.FC<{onAppOpen: (app: AppDefinition) => void}> = ({
  onAppOpen,
}) => (
  <div className="flex flex-wrap content-start p-4 animate-fade-in">
    {APP_DEFINITIONS_CONFIG.map((app) => (
      <Icon key={app.id} app={app} onInteract={() => onAppOpen(app)} />
    ))}
  </div>
);

const AppSkeleton: React.FC = () => (
  <div className="p-6 space-y-6 animate-fade-in">
    <div className="flex items-center space-x-4">
      <div className="h-10 w-10 rounded-full animate-shimmer"></div>
      <div className="h-6 w-1/4 rounded-md animate-shimmer"></div>
    </div>
    <div className="space-y-3">
      <div className="h-4 w-full rounded-md animate-shimmer"></div>
      <div className="h-4 w-11/12 rounded-md animate-shimmer"></div>
      <div className="h-4 w-4/5 rounded-md animate-shimmer"></div>
    </div>
    <div className="grid grid-cols-2 gap-6 mt-8">
      <div className="h-32 rounded-xl animate-shimmer"></div>
      <div className="h-32 rounded-xl animate-shimmer"></div>
    </div>
  </div>
);

const LoadingOverlay: React.FC = () => (
  <div className="loading-overlay">
    <div className="flex flex-col items-center">
      <div className="loading-ring"></div>
      <p className="mt-4 text-blue-600 font-medium text-sm tracking-wide animate-pulse">
        PROCESSING DATA...
      </p>
    </div>
  </div>
);

const Clock: React.FC = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="text-white/80 text-xs font-medium px-2 flex flex-col items-end leading-none">
      <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      <span className="mt-1 opacity-60">{time.toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
    </div>
  );
};

const Taskbar: React.FC<{
  activeAppId: string | null;
  onAppClick: (app: AppDefinition) => void;
  onDesktopClick: () => void;
  onSettingsClick: () => void;
  isSettingsOpen: boolean;
}> = ({ activeAppId, onAppClick, onDesktopClick, onSettingsClick, isSettingsOpen }) => {
  return (
    <div className="taskbar">
      <div className="flex items-center gap-2">
        <div 
          className={`taskbar-item group ${!activeAppId && !isSettingsOpen ? 'active' : ''}`}
          onClick={onDesktopClick}
          title="Desktop"
        >
          <span className="group-hover:rotate-12 transition-transform">💎</span>
        </div>
        <div className="h-6 w-px bg-white/10 mx-1"></div>
        {/* Pinned/Running Apps */}
        {APP_DEFINITIONS_CONFIG.slice(0, 4).map(app => (
          <div 
            key={app.id}
            className={`taskbar-item ${activeAppId === app.id ? 'active' : ''}`}
            onClick={() => onAppClick(app)}
            title={app.name}
          >
            {app.icon}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <div 
          className={`taskbar-item ${isSettingsOpen ? 'active' : ''}`}
          onClick={onSettingsClick}
          title="Settings"
        >
          ⚙️
        </div>
        <div className="h-6 w-px bg-white/10 mx-1"></div>
        <Clock />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeApp, setActiveApp] = useState<AppDefinition | null>(null);
  const [llmContent, setLlmContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [interactionHistory, setInteractionHistory] = useState<InteractionData[]>([]);
  
  // User Profile State & Persistence
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gemini_os_user_profile');
    return saved ? JSON.parse(saved) : { username: 'GeminiUser', avatar: '🤖' };
  });

  useEffect(() => {
    localStorage.setItem('gemini_os_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Undo/Redo Stacks
  const [historyUndoStack, setHistoryUndoStack] = useState<InteractionData[][]>([]);
  const [historyRedoStack, setHistoryRedoStack] = useState<InteractionData[][]>([]);

  const [isParametersOpen, setIsParametersOpen] = useState<boolean>(false);
  const [currentMaxHistoryLength, setCurrentMaxHistoryLength] =
    useState<number>(INITIAL_MAX_HISTORY_LENGTH);

  const [isStatefulnessEnabled, setIsStatefulnessEnabled] =
    useState<boolean>(false);
  const [appContentCache, setAppContentCache] = useState<
    Record<string, string>
  >({});
  const [currentAppPath, setCurrentAppPath] = useState<string[]>([]);

  const internalHandleLlmRequest = useCallback(
    async (historyForLlm: InteractionData[], maxHistoryLength: number) => {
      if (historyForLlm.length === 0) {
        setError('No interaction data to process.');
        return;
      }

      setIsLoading(true);
      setError(null);

      let accumulatedContent = '';

      try {
        const stream = streamAppContent(historyForLlm, maxHistoryLength, userProfile);
        for await (const chunk of stream) {
          accumulatedContent += chunk;
          setLlmContent((prev) => prev + chunk);
        }
      } catch (e: any) {
        setError('Failed to stream content from the API.');
        console.error(e);
        accumulatedContent = `<div class="p-4 text-red-600 bg-red-100 rounded-md">Error loading content.</div>`;
        setLlmContent(accumulatedContent);
      } finally {
        setIsLoading(false);
      }
    },
    [userProfile],
  );

  const handleInteraction = useCallback(
    async (interactionData: InteractionData) => {
      if (interactionData.id === 'app_close_button') {
        handleCloseAppView();
        return;
      }
      
      if (interactionData.id === 'system_undo') {
        handleUndo();
        return;
      }

      if (interactionData.id === 'system_redo') {
        handleRedo();
        return;
      }

      setHistoryUndoStack(prev => [...prev, interactionHistory]);
      setHistoryRedoStack([]);

      const newHistory = [
        interactionData,
        ...interactionHistory.slice(0, currentMaxHistoryLength - 1),
      ];
      setInteractionHistory(newHistory);

      const newPath = activeApp
        ? [...currentAppPath, interactionData.id]
        : [interactionData.id];
      setCurrentAppPath(newPath);
      const cacheKey = newPath.join('__');

      setLlmContent('');
      setError(null);

      if (isStatefulnessEnabled && appContentCache[cacheKey]) {
        setLlmContent(appContentCache[cacheKey]);
        setIsLoading(false);
      } else {
        internalHandleLlmRequest(newHistory, currentMaxHistoryLength);
      }
    },
    [
      interactionHistory,
      internalHandleLlmRequest,
      activeApp,
      currentMaxHistoryLength,
      currentAppPath,
      isStatefulnessEnabled,
      appContentCache,
    ],
  );

  const handleUndo = useCallback(() => {
    if (historyUndoStack.length === 0) return;

    const previousHistory = historyUndoStack[historyUndoStack.length - 1];
    setHistoryRedoStack(prev => [...prev, interactionHistory]);
    setHistoryUndoStack(prev => prev.slice(0, -1));
    setInteractionHistory(previousHistory);

    setLlmContent('');
    internalHandleLlmRequest(previousHistory, currentMaxHistoryLength);
  }, [historyUndoStack, interactionHistory, currentMaxHistoryLength, internalHandleLlmRequest]);

  const handleRedo = useCallback(() => {
    if (historyRedoStack.length === 0) return;

    const nextHistory = historyRedoStack[historyRedoStack.length - 1];
    setHistoryUndoStack(prev => [...prev, interactionHistory]);
    setHistoryRedoStack(prev => prev.slice(0, -1));
    setInteractionHistory(nextHistory);

    setLlmContent('');
    internalHandleLlmRequest(nextHistory, currentMaxHistoryLength);
  }, [historyRedoStack, interactionHistory, currentMaxHistoryLength, internalHandleLlmRequest]);

  const handleAppOpen = (app: AppDefinition) => {
    const initialInteraction: InteractionData = {
      id: app.id,
      type: 'app_open',
      elementText: app.name,
      elementType: 'icon',
      appContext: app.id,
    };

    setHistoryUndoStack([]);
    setHistoryRedoStack([]);
    const newHistory = [initialInteraction];
    setInteractionHistory(newHistory);

    const appPath = [app.id];
    setCurrentAppPath(appPath);

    if (isParametersOpen) {
      setIsParametersOpen(false);
    }
    setActiveApp(app);
    setLlmContent('');
    setError(null);

    internalHandleLlmRequest(newHistory, currentMaxHistoryLength);
  };

  const handleCloseAppView = () => {
    setActiveApp(null);
    setLlmContent('');
    setError(null);
    setInteractionHistory([]);
    setCurrentAppPath([]);
    setHistoryUndoStack([]);
    setHistoryRedoStack([]);
  };

  const handleToggleParametersPanel = () => {
    setIsParametersOpen((prevIsOpen) => {
      if (!prevIsOpen) {
        setActiveApp(null);
        setLlmContent('');
        setError(null);
      } else {
        setActiveApp(null);
        setLlmContent('');
        setError(null);
        setInteractionHistory([]);
        setCurrentAppPath([]);
      }
      return !prevIsOpen;
    });
  };

  const handleUpdateHistoryLength = (newLength: number) => {
    setCurrentMaxHistoryLength(newLength);
    setInteractionHistory((prev) => prev.slice(0, newLength));
  };

  const handleSetStatefulness = (enabled: boolean) => {
    setIsStatefulnessEnabled(enabled);
    if (!enabled) {
      setAppContentCache({});
    }
  };

  const windowTitle = isParametersOpen
    ? 'Settings'
    : activeApp
      ? activeApp.name
      : 'Gemini Computer';

  const handleMasterClose = () => {
    if (isParametersOpen) {
      handleToggleParametersPanel();
    } else if (activeApp) {
      handleCloseAppView();
    }
  };

  return (
    <div className="bg-[#1a1a1a] w-full min-h-screen flex flex-col overflow-hidden">
      {/* Main OS Area */}
      <div className="flex-grow flex items-center justify-center p-4 relative">
        <Window
          title={windowTitle}
          onClose={handleMasterClose}
          isAppOpen={!!activeApp && !isParametersOpen}
          appId={activeApp?.id}
          onToggleParameters={handleToggleParametersPanel}
          onExitToDesktop={handleCloseAppView}
          isParametersPanelOpen={isParametersOpen}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyUndoStack.length > 0}
          canRedo={historyRedoStack.length > 0}
          userProfile={userProfile}
        >
          <div className="w-full h-full relative overflow-hidden bg-white">
            {isParametersOpen ? (
              <ParametersPanel
                currentLength={currentMaxHistoryLength}
                onUpdateHistoryLength={handleUpdateHistoryLength}
                onClosePanel={handleToggleParametersPanel}
                isStatefulnessEnabled={isStatefulnessEnabled}
                onSetStatefulness={handleSetStatefulness}
                userProfile={userProfile}
                onUpdateUserProfile={setUserProfile}
              />
            ) : !activeApp ? (
              <DesktopView onAppOpen={handleAppOpen} />
            ) : (
              <>
                {isLoading && <div className="loading-bar"></div>}
                {isLoading && llmContent.length === 0 && <AppSkeleton />}
                {isLoading && llmContent.length > 0 && <LoadingOverlay />}
                {error && (
                  <div className="p-4 m-4 text-red-600 bg-red-100 rounded-md animate-fade-in border border-red-200">
                    {error}
                  </div>
                )}
                {llmContent && (
                  <div className={`w-full h-full ${isLoading ? 'opacity-40 pointer-events-none' : 'opacity-100 animate-blur-in'}`}>
                    <GeneratedContent
                      htmlContent={llmContent}
                      onInteract={handleInteraction}
                      appContext={activeApp.id}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </Window>
      </div>

      {/* Taskbar */}
      <Taskbar 
        activeAppId={activeApp?.id || null} 
        onAppClick={handleAppOpen}
        onDesktopClick={handleCloseAppView}
        onSettingsClick={handleToggleParametersPanel}
        isSettingsOpen={isParametersOpen}
      />
    </div>
  );
};

export default App;
