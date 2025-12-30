
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useState} from 'react';
import {UserProfile} from '../types';

interface ParametersPanelProps {
  currentLength: number;
  onUpdateHistoryLength: (newLength: number) => void;
  onClosePanel: () => void;
  isStatefulnessEnabled: boolean;
  onSetStatefulness: (enabled: boolean) => void;
  userProfile: UserProfile;
  onUpdateUserProfile: (profile: UserProfile) => void;
}

const AVATAR_OPTIONS = ['🤖', '👤', '👩‍💻', '👨‍💻', '🚀', '🌟', '🛡️', '👾'];

export const ParametersPanel: React.FC<ParametersPanelProps> = ({
  currentLength,
  onUpdateHistoryLength,
  onClosePanel,
  isStatefulnessEnabled,
  onSetStatefulness,
  userProfile,
  onUpdateUserProfile,
}) => {
  const [localHistoryLengthInput, setLocalHistoryLengthInput] =
    useState<string>(currentLength.toString());
  const [localStatefulnessChecked, setLocalStatefulnessChecked] =
    useState<boolean>(isStatefulnessEnabled);
  
  const [localUsername, setLocalUsername] = useState<string>(userProfile.username);
  const [localAvatar, setLocalAvatar] = useState<string>(userProfile.avatar);

  useEffect(() => {
    setLocalHistoryLengthInput(currentLength.toString());
  }, [currentLength]);

  useEffect(() => {
    setLocalStatefulnessChecked(isStatefulnessEnabled);
  }, [isStatefulnessEnabled]);

  const handleApplyParameters = () => {
    const newLength = parseInt(localHistoryLengthInput, 10);
    if (!isNaN(newLength) && newLength >= 0 && newLength <= 10) {
      onUpdateHistoryLength(newLength);
    } else {
      alert('Please enter a number between 0 and 10.');
      return;
    }

    if (localStatefulnessChecked !== isStatefulnessEnabled) {
      onSetStatefulness(localStatefulnessChecked);
    }

    onUpdateUserProfile({
      username: localUsername.trim() || 'Guest',
      avatar: localAvatar
    });

    onClosePanel();
  };

  return (
    <div className="p-8 bg-gray-50 h-full flex flex-col items-start overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b w-full pb-2">Settings</h2>
      
      {/* User Profile Section */}
      <div className="w-full max-w-md mb-10">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">User Profile</h3>
        <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              value={localUsername}
              onChange={(e) => setLocalUsername(e.target.value)}
              className="llm-input m-0"
              placeholder="Enter username..."
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Avatar</label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_OPTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => setLocalAvatar(emoji)}
                  className={`text-2xl p-2 rounded-lg transition-all ${localAvatar === emoji ? 'bg-blue-100 ring-2 ring-blue-400 scale-110' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* System Settings Section */}
      <div className="w-full max-w-md mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">OS Configuration</h3>
        <div className="space-y-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <label htmlFor="maxHistoryLengthInput" className="text-sm font-medium text-gray-700">
              Max History Length
            </label>
            <input
              type="number"
              id="maxHistoryLengthInput"
              value={localHistoryLengthInput}
              onChange={(e) => setLocalHistoryLengthInput(e.target.value)}
              min="0"
              max="10"
              className="llm-input w-20 m-0"
            />
          </div>
          <div className="flex items-center justify-between">
            <label htmlFor="statefulnessCheckbox" className="text-sm font-medium text-gray-700">
              Enable Statefulness
            </label>
            <input
              type="checkbox"
              id="statefulnessCheckbox"
              checked={localStatefulnessChecked}
              onChange={(e) => setLocalStatefulnessChecked(e.target.checked)}
              className="h-5 w-5 text-blue-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto pt-6 w-full max-w-md flex justify-start gap-3">
        <button onClick={handleApplyParameters} className="llm-button m-0 bg-blue-600 hover:bg-blue-700">
          Save Settings
        </button>
        <button onClick={onClosePanel} className="llm-button m-0 bg-gray-500 hover:bg-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
};
