
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import React, {useEffect, useRef} from 'react';
import {InteractionData} from '../types';

interface GeneratedContentProps {
  htmlContent: string;
  onInteract: (data: InteractionData) => void;
  appContext: string | null;
  isLoading: boolean;
}

export const GeneratedContent: React.FC<GeneratedContentProps> = ({
  htmlContent,
  onInteract,
  appContext,
  isLoading,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const processedHtmlContentRef = useRef<string | null>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const triggerInteraction = (targetElement: HTMLElement) => {
      let interactionValue: string | undefined =
        targetElement.dataset.interactionValue;

      if (targetElement.dataset.valueFrom) {
        const inputElement = document.getElementById(
          targetElement.dataset.valueFrom,
        ) as HTMLInputElement | HTMLTextAreaElement;
        if (inputElement) {
          interactionValue = inputElement.value;
        }
      }

      const interactionData: InteractionData = {
        id: targetElement.dataset.interactionId || 'unknown',
        type: targetElement.dataset.interactionType || 'generic_click',
        value: interactionValue,
        elementType: targetElement.tagName.toLowerCase(),
        elementText: (
          targetElement.innerText ||
          (targetElement as HTMLInputElement).value ||
          ''
        )
          .trim()
          .substring(0, 75),
        appContext: appContext,
      };
      onInteract(interactionData);
    };

    const handleClick = (event: MouseEvent) => {
      let targetElement = event.target as HTMLElement;

      while (
        targetElement &&
        targetElement !== container &&
        !targetElement.dataset.interactionId
      ) {
        targetElement = targetElement.parentElement as HTMLElement;
      }

      if (targetElement && targetElement.dataset.interactionId) {
        event.preventDefault();
        triggerInteraction(targetElement);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        const target = event.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
        
        if (isInput) {
          const inputId = target.id;
          
          // Case A: Input has an ID and might have a linked submit button
          if (inputId) {
            const submitButton = container.querySelector(
              `[data-value-from="${inputId}"]`,
            ) as HTMLElement;
            
            if (submitButton) {
              event.preventDefault();
              triggerInteraction(submitButton);
              return;
            }
          }

          // Case B: It is a terminal input (checking class specifically)
          // This must be independent of inputId check because terminals often use raw inputs
          if (target.classList.contains('terminal-input')) {
            event.preventDefault();
            const interactionData: InteractionData = {
              id: 'terminal_execute',
              type: 'command_run',
              value: (target as HTMLInputElement).value,
              elementType: 'input',
              elementText: 'Run Command',
              appContext: appContext,
            };
            onInteract(interactionData);
          }
        }
      }
    };

    container.addEventListener('click', handleClick);
    container.addEventListener('keydown', handleKeyDown);

    const scrollToBottom = () => {
      const terminal = container.querySelector('.llm-terminal');
      if (terminal) {
        terminal.scrollTop = terminal.scrollHeight;
      }
    };

    if (!isLoading) {
      if (htmlContent !== processedHtmlContentRef.current) {
        const scripts = Array.from(container.getElementsByTagName('script')) as HTMLScriptElement[];
        scripts.forEach((oldScript) => {
          try {
            const newScript = document.createElement('script');
            Array.from(oldScript.attributes).forEach((attr) =>
              newScript.setAttribute(attr.name, attr.value),
            );
            newScript.text = oldScript.innerHTML;

            if (oldScript.parentNode) {
              oldScript.parentNode.replaceChild(newScript, oldScript);
            }
          } catch (e) {
            console.error('Error executing script tag:', e);
          }
        });
        processedHtmlContentRef.current = htmlContent;
        scrollToBottom();
        
        // Focus terminal input if present
        const termInput = container.querySelector('.terminal-input') as HTMLInputElement;
        if (termInput) {
          termInput.focus();
        }
      }
    } else {
      processedHtmlContentRef.current = null;
      scrollToBottom();
    }

    return () => {
      container.removeEventListener('click', handleClick);
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [htmlContent, onInteract, appContext, isLoading]);

  return (
    <div
      ref={contentRef}
      className={`w-full h-full overflow-y-auto transition-opacity duration-300 ${isLoading && !htmlContent ? 'opacity-0' : 'opacity-100'}`}
      dangerouslySetInnerHTML={{__html: htmlContent}}
    />
  );
};
