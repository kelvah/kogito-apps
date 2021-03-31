import axios, { AxiosRequestConfig, CancelTokenSource } from 'axios';
import MockAdapter from 'axios-mock-adapter';
import generateFakeApis from '../../../api-mock/db';

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
