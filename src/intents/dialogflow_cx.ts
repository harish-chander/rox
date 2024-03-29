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
import logger from '@fonos/logger'
import dialogflow, { SessionsClient } from '@google-cloud/dialogflow-cx'
import { Effect } from '../@types/cerebro'
import { DialogFlowConfig, Intents, Intent } from '../@types/intents'
import { transformPayloadToEffect } from './df_utils'

export default class DialogFlowCX implements Intents {
  sessionClient: SessionsClient
  sessionPath: any
  config: DialogFlowConfig
  constructor(config: DialogFlowConfig) {
    const uuid = require('uuid')
    const sessionId = uuid.v4()
    const credentials = require(config.keyFilename)

    let c = {
      apiEndpoint: `${process.env.INTENTS_ENGINE_LOCATION}-dialogflow.googleapis.com`,
      credentials: {
        private_key: credentials.private_key,
        client_email: credentials.client_email,
      }
    }

    // Create a new session
    this.sessionClient = new dialogflow.SessionsClient(c)
    this.sessionPath = this.sessionClient.projectLocationAgentSessionPath(
      config.projectId,
      process.env.INTENTS_ENGINE_LOCATION as string,
      process.env.INTENTS_ENGINE_AGENT as string,
      sessionId
    )
    this.config = config
  }

  async findIntent(
    txt: string
  ): Promise<Intent> {
    const request = {
      session: this.sessionPath,
      queryInput: {
        text: {
          text: txt,
        },
        languageCode: this.config.languageCode,
      },
    }

    const responses = await this.sessionClient.detectIntent(request)

    logger.silly(
      `@rox/intents got speech [intent response => ${JSON.stringify(responses, null, ' ')}]`
    )

    if (!responses
      || !responses[0].queryResult
      || !responses[0].queryResult.responseMessages) {
      throw new Error("@rox/intents unexpect null intent")
    }

    const effects: Effect[] = this
      .getEffects(
        responses[0].queryResult.responseMessages as Record<string, any>[])

    const ref = responses[0].queryResult.intent
      ? responses[0].queryResult.intent.displayName || "unknown"
      : "unknown"

    return {
      ref,
      effects,
      confidence: responses[0].queryResult.intentDetectionConfidence || 0,
      allRequiredParamsPresent: responses[0].queryResult.text ? true : false
    }
  }

  private getEffects(responseMessages: Record<string, any>[]): Effect[] {
    const effects = new Array()
    for (const r of responseMessages) {
      if (r.message === "text") {
        effects.push({
          type: "say",
          parameters: {
            response: r.text.text[0]
          }
        })
        continue
      } else if (!r.payload) {
        continue
      }
      effects.push(transformPayloadToEffect(r.payload))
    }
    return effects
  }
}
