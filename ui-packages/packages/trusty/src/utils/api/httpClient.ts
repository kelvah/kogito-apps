import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import generateFakeApis from '../../../api-mock/db';
import faker from 'faker';
const mock = new MockAdapter(axios, { delayResponse: 1500 });

export const httpClient = axios.create({
  // @ts-ignore
  baseURL: window.TRUSTY_ENDPOINT || process.env.KOGITO_TRUSTY_API_HTTP_URL,
  timeout: 5000,
  headers: {}
});

export const EXECUTIONS_PATH = '/executions';

export const callOnceHandler = () => {
  let caller: CancelTokenSource;

  return (config: AxiosRequestConfig) => {
    if (caller) {
      caller.cancel('Request superseded');
    }
    caller = axios.CancelToken.source();

    config.cancelToken = caller.token;
    return httpClient(config);
  };
};

const mockedData = generateFakeApis();

mock.onGet('/executions').reply(200, mockedData.executions);

mock.onGet(/\/executions\/decisions\/[A-z0-9-]+$/).reply(config => {
  const id = config.url.split('/')[3];

  return [
    200,
    mockedData.executions.headers.find(
      execution => execution.executionId === id
    )
  ];
});

mock.onGet(/\/executions\/decisions\/[A-z0-9-]+\/outcomes$/).reply(config => {
  const id = config.url.split('/')[3];

  return [
    200,
    mockedData.outcomes.find(outcome => outcome.header.executionId === id)
  ];
});

mock
  .onGet(/\/executions\/decisions\/[A-z0-9-]+\/outcomes\/[A-z0-9-]+/)
  .reply(config => {
    const outcomeId = config.url.split('/')[5];
    return [
      200,
      mockedData.outcomeDetail.find(outcome => outcome.outcomeId === outcomeId)
    ];
  });

mock
  .onGet(/\/executions\/decisions\/[A-z0-9-]+\/explanations\/saliencies/)
  .reply(() => {
    return [200, mockedData.saliencies];
  });

mock
  .onGet(/\/executions\/decisions\/[A-z0-9-]+\/structuredInputs$/)
  .reply(() => {
    return [200, mockedData.inputs];
  });

mock.onGet(/\/executions\/[A-z0-9-]+\/model$/).reply(config => {
  const id = config.url.split('/')[2];
  return [200, mockedData.models.find(model => model.executionId === id)];
});

// Counterfactual Mocks start here

mock
  .onPost(/\/executions\/decisions\/[A-z0-9-]+\/explanations\/counterfactuals/)
  .reply(config => {
    const executionId = config.url.split('/')[2];
    return [
      200,
      {
        executionId: executionId,
        counterfactualId: faker.random.uuid()
      }
    ];
  });

let cfHit = 0;
let cfExecutionId = null;
let cfResults = [];
let cfBaseId = 0;

mock
  .onGet(
    /\/executions\/decisions\/[A-z0-9-]+\/explanations\/counterfactuals\/[A-z0-9-]+/
  )
  .reply(config => {
    const queryExecutionId = config.url.split('/')[2];
    const queryCounterfactualId = config.url.split('/')[5];
    if (cfExecutionId === null || cfExecutionId !== queryExecutionId) {
      cfExecutionId = queryExecutionId;
      cfHit = 0;
      cfResults = [];
      cfBaseId = 1000;
    }
    cfHit++;
    if (cfHit === 1) {
      for (let i = 0; i < 10; i++) {
        cfResults.unshift(getResult(queryExecutionId, cfBaseId, false));
        cfBaseId++;
      }
    }
    if (cfHit === 1) {
      for (let i = 0; i < 10; i++) {
        cfResults.unshift(getResult(queryExecutionId, cfBaseId, false));
        cfBaseId++;
      }
    }
    if (cfHit === 2) {
      for (let i = 0; i < 15; i++) {
        cfResults.unshift(getResult(queryExecutionId, cfBaseId, false));
        cfBaseId++;
      }
      cfResults.splice(15 - cfResults.length);
    }
    if (cfHit === 3) {
      for (let i = 0; i < 8; i++) {
        cfResults.unshift(getResult(queryExecutionId, cfBaseId, false));
        cfBaseId++;
      }
      cfResults.unshift(getResult(queryExecutionId, cfBaseId, true));
      cfResults.splice(15 - cfResults.length);
      cfExecutionId = null;
    }
    return [
      200,
      {
        executionId: queryExecutionId,
        counterfactualId: queryCounterfactualId,
        solutions: cfResults
      }
    ];
  });

function getResult(executionId, baseId, isFinal) {
  return {
    ...interim,
    executionId,
    solutionId: (baseId + 1).toString(),
    stage: isFinal ? 'FINAL' : 'INTERMEDIATE',
    inputs: mockedData.inputs.inputs.map((input, index) => {
      if (index === 0) {
        return {
          ...input,
          value: Math.floor(
            Math.random() * input.value * 0.2 * (Math.random() > 0.5 ? 1 : -1) +
              input.value
          )
        };
      }
      if (index === 1) {
        return {
          ...input,
          value: Math.floor(
            Math.random() * input.value * 0.2 * (Math.random() > 0.5 ? 1 : -1) +
              input.value
          )
        };
      }
      return input;
    })
  };
}

const interim = {
  type: 'counterfactual',
  valid: true,
  executionId: 'executionId',
  status: 'SUCCEEDED',
  statusDetails: '',
  counterfactualId: 'counterfactualId',
  solutionId: 'solution1',
  isValid: true,
  stage: 'INTERMEDIATE',
  inputs: [],
  outputs: []
};
