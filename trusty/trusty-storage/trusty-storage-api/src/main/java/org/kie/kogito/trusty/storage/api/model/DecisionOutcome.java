/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.kie.kogito.trusty.storage.api.model;

import java.util.Collection;

import org.kie.kogito.tracing.decision.event.message.MessageLevel;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class DecisionOutcome {

    public static final String EVALUATION_STATUS_FIELD = "evaluationStatus";
    public static final String MESSAGES_FIELD = "messages";
    public static final String OUTCOME_ID_FIELD = "outcomeId";
    public static final String OUTCOME_INPUTS_FIELD = "outcomeInputs";
    public static final String OUTCOME_NAME_FIELD = "outcomeName";
    public static final String OUTCOME_RESULT_FIELD = "outcomeResult";
    public static final String HAS_ERRORS_FIELD = "hasErrors";

    @JsonProperty(OUTCOME_ID_FIELD)
    private String outcomeId;

    @JsonProperty(OUTCOME_NAME_FIELD)
    private String outcomeName;

    @JsonProperty(EVALUATION_STATUS_FIELD)
    private String evaluationStatus;

    @JsonProperty(OUTCOME_RESULT_FIELD)
    private TypedVariableWithValue outcomeResult;

    @JsonProperty(OUTCOME_INPUTS_FIELD)
    private Collection<TypedVariableWithValue> outcomeInputs;

    @JsonProperty(MESSAGES_FIELD)
    private Collection<Message> messages;

    public DecisionOutcome() {
    }

    public DecisionOutcome(String outcomeId, String outcomeName, String evaluationStatus, TypedVariableWithValue outcomeResult, Collection<TypedVariableWithValue> outcomeInputs,
            Collection<Message> messages) {
        this.outcomeId = outcomeId;
        this.outcomeName = outcomeName;
        this.evaluationStatus = evaluationStatus;
        this.outcomeResult = outcomeResult;
        this.outcomeInputs = outcomeInputs;
        this.messages = messages;
    }

    @JsonIgnore
    public String getOutcomeId() {
        return outcomeId;
    }

    @JsonIgnore
    public void setOutcomeId(String outcomeId) {
        this.outcomeId = outcomeId;
    }

    @JsonIgnore
    public String getOutcomeName() {
        return outcomeName;
    }

    @JsonIgnore
    public void setOutcomeName(String outcomeName) {
        this.outcomeName = outcomeName;
    }

    @JsonIgnore
    public String getEvaluationStatus() {
        return evaluationStatus;
    }

    @JsonIgnore
    public void setEvaluationStatus(String evaluationStatus) {
        this.evaluationStatus = evaluationStatus;
    }

    @JsonIgnore
    public TypedVariableWithValue getOutcomeResult() {
        return outcomeResult;
    }

    @JsonIgnore
    public void setOutcomeResult(TypedVariableWithValue outcomeResult) {
        this.outcomeResult = outcomeResult;
    }

    @JsonIgnore
    public Collection<TypedVariableWithValue> getOutcomeInputs() {
        return outcomeInputs;
    }

    @JsonIgnore
    public void setOutcomeInputs(Collection<TypedVariableWithValue> outcomeInputs) {
        this.outcomeInputs = outcomeInputs;
    }

    @JsonIgnore
    public Collection<Message> getMessages() {
        return messages;
    }

    @JsonIgnore
    public void setMessages(Collection<Message> messages) {
        this.messages = messages;
    }

    @JsonProperty(HAS_ERRORS_FIELD)
    public boolean hasErrors() {
        return messages != null && messages.stream().anyMatch(m -> m.getLevel() == MessageLevel.ERROR);
    }
}
