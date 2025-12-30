
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React from 'react';
import {UserProfile} from '../types';

interface WindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  isAppOpen: boolean;
  appId?: string | null;
  onToggleParameters: () => void;
  onExitToDesktop: () => void;
  isParametersPanelOpen?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  userProfile?: UserProfile;
}

const MenuItem: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}> = ({children, onClick, className, disabled}) => (
  <span
    className={`menu-item cursor-pointer transition-colors ${disabled ? 'opacity-30 cursor-not-allowed text-gray-400' : 'hover:text-blue-600'} ${className}`}
    onClick={!disabled ? onClick : undefined}
    onKeyDown={(e) => {
      if (!disabled && (e.key === 'Enter' || e.key === ' ')) onClick?.();
    }}
    tabIndex={disabled ? -1 : 0}
    role="button">
    {children}
  </span>
);

export const Window: React.FC<WindowProps> = ({
  title,
  children,
  onClose,
  isAppOpen,
  onToggleParameters,
  onExitToDesktop,
  isParametersPanelOpen,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  userProfile,
}) => {
  return (
    <div className="w-[850px] h-[650px] bg-white border border-gray-300 rounded-xl shadow-2xl flex flex-col relative overflow-hidden font-sans backdrop-blur-sm bg-white/80 animate-fade-in">
      {/* Title Bar */}
      <div className="bg-gray-800/95 text-white py-2 px-4 font-semibold text-base flex justify-between items-center select-none cursor-default rounded-t-xl flex-shrink-0 border-b border-black/20">
        <div className="flex items-center gap-3">
          <span className="title-bar-text tracking-tight">{title}</span>
          {userProfile && (
            <div className="flex items-center gap-2 bg-white/10 px-2.5 py-1 rounded-full text-xs font-normal border border-white/5">
              <span>{userProfile.avatar}</span>
              <span className="opacity-90">{userProfile.username}</span>
            </div>
          )}
        </div>

        {/* Window Controls */}
        <div className="flex items-center gap-1.5">
          <button 
            className="window-control-btn group hover:bg-white/10" 
            title="Minimize"
            onClick={() => console.log('Minimize triggered')}
            aria-label="Minimize Window"
          >
            <div className="control-dot bg-yellow-400 group-hover:bg-yellow-500 shadow-sm shadow-yellow-900/40">—</div>
          </button>
          <button 
            className="window-control-btn group hover:bg-white/10" 
            title="Maximize"
            onClick={() => console.log('Maximize triggered')}
            aria-label="Maximize Window"
          >
            <div className="control-dot bg-green-400 group-hover:bg-green-500 shadow-sm shadow-green-900/40">＋</div>
          </button>
          <button 
            className="window-control-btn group hover:bg-red-500/20" 
            title="Close"
            onClick={onClose}
            aria-label="Close Window"
          >
            <div className="control-dot bg-red-400 group-hover:bg-red-500 shadow-sm shadow-red-900/40">✕</div>
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-gray-100/90 py-2 px-4 border-b border-gray-200 select-none flex gap-6 flex-shrink-0 text-sm text-gray-700 items-center">
        {!isParametersPanelOpen && (
          <MenuItem onClick={onToggleParameters}>
            ⚙️ <u>S</u>ettings
          </MenuItem>
        )}
        
        {isAppOpen && (
          <>
            <div className="h-4 w-px bg-gray-300 mx-1"></div>
            <MenuItem onClick={onUndo} disabled={!canUndo}>
              Undo
            </MenuItem>
            <MenuItem onClick={onRedo} disabled={!canRedo}>
              Redo
            </MenuItem>
          </>
        )}

        {isAppOpen && (
          <MenuItem onClick={onExitToDesktop} className="ml-auto flex items-center gap-1 text-gray-500 hover:text-blue-600 transition-colors">
            Exit to Desktop ⇱
          </MenuItem>
        )}
      </div>

      {/* Content */}
      <div className="flex-grow overflow-hidden">{children}</div>
    </div>
  );
};
