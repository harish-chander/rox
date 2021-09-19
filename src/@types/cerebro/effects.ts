/*
 * Copyright (C) 2021 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster/rox
 *
 * This file is part of Rox
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { VoiceResponse } from '@fonos/voice'
import { EventsClient } from '../../events/emitter'

export interface EffectsManagerConfig {
  eventsClient: EventsClient
  voice: VoiceResponse
  voiceConfig: any
  playbackId: string
}

export interface Effect {
  type: 'say'
  | 'play'
  | 'record'
  | 'hangup'
  | 'send_data'
  parameters: Record<string, unknown>
}