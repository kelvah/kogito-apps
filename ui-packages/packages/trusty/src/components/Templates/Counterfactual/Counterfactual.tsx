import React, { useEffect, useReducer, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerContentBody,
  DrawerPanelContent,
  Flex,
  FlexItem,
  PageSection,
  Stack,
  StackItem,
  Title
} from '@patternfly/react-core';
import CounterfactualTable from '../../Organisms/CounterfactualTable/CounterfactualTable';
import CounterfactualToolbar from '../../Organisms/CounterfactualToolbar/CounterfactualToolbar';
import CounterfactualInputDomainEdit from '../../Organisms/CounterfactualInputDomainEdit/CounterfactualInputDomainEdit';
import CounterfactualOutcomesSelected from '../../Molecules/CounterfactualsOutcomesSelected/CounterfactualOutcomesSelected';
import { cfActions, cfInitialState, cfReducer } from './counterfactualReducer';
import { ItemObject } from '../../../types';
import CounterfactualHint from '../../Molecules/CounterfactualHint/CounterfactualHint';
import CounterfactualExecutionInfo from '../../Molecules/CounterfactualExecutionInfo/CounterfactualExecutionInfo';
import CounterfactualSuccessMessage from '../../Molecules/CounterfactualSuccessMessage/CounterfactualSuccessMessage';
import './Counterfactual.scss';

const Counterfactual = () => {
  const [state, dispatch] = useReducer(cfReducer, cfInitialState);
  const [isSidePanelExpanded, setIsSidePanelExpanded] = useState(false);
  const [inputDomainEdit, setInputDomainEdit] = useState<{
    input: CFSearchInput;
    inputIndex: number;
  }>();

  const handleInputDomainEdit = (input: CFSearchInput, inputIndex: number) => {
    setInputDomainEdit({ input, inputIndex });
    if (!isSidePanelExpanded) {
      setIsSidePanelExpanded(true);
    }
  };

  const areInputsSelected = (inputs: CFSearchInput[]) => {
    // filtering all non fixed inputs
    const selectedInputs = inputs.filter(domain => !domain.isFixed);
    // checking if all inputs have a domain specified (with the exception of
    // boolean, which do not require one)
    return (
      selectedInputs.length > 0 &&
      selectedInputs.every(input => input.domain || input.typeRef === 'boolean')
    );
  };

  useEffect(() => {
    if (
      areInputsSelected(state.searchDomains) &&
      state.goals.filter(goal => !goal.isFixed).length > 0
    ) {
      if (state.status.isDisabled) {
        dispatch({ type: 'setStatus', payload: { isDisabled: false } });
      }
    } else {
      if (!state.status.isDisabled) {
        dispatch({ type: 'setStatus', payload: { isDisabled: true } });
      }
    }
  }, [state.searchDomains, state.goals, state.status.isDisabled]);

  useEffect(() => {
    if (state.status.executionStatus === 'RUNNING') {
      setTimeout(() => {
        dispatch({
          type: 'setResults',
          payload: {
            results: cfResultsdemo
          }
        });
      }, 4000);
      setTimeout(() => {
        dispatch({
          type: 'setStatus',
          payload: {
            executionStatus: 'RUN'
          }
        });
      }, 10000);
    }
  }, [state.status.executionStatus]);

  const panelContent = (
    <DrawerPanelContent widths={{ default: 'width_33' }}>
      {inputDomainEdit && (
        <CounterfactualInputDomainEdit
          input={inputDomainEdit.input}
          inputIndex={inputDomainEdit.inputIndex}
          onClose={() => setIsSidePanelExpanded(false)}
        />
      )}
    </DrawerPanelContent>
  );

  return (
    <CFDispatch.Provider value={dispatch}>
      <Drawer
        isExpanded={isSidePanelExpanded}
        className="counterfactual__drawer"
      >
        <DrawerContent panelContent={panelContent}>
          <DrawerContentBody>
            <PageSection variant="default" isFilled={true}>
              <section className="counterfactual__section">
                <Stack hasGutter>
                  <StackItem>
                    <Flex spaceItems={{ default: 'spaceItemsXl' }}>
                      <FlexItem>
                        <Title headingLevel="h3" size="2xl">
                          Counterfactual Analysis
                        </Title>
                      </FlexItem>
                      <FlexItem>
                        <CounterfactualOutcomesSelected goals={state.goals} />
                      </FlexItem>
                      {state.status.executionStatus === 'RUN' && (
                        <CounterfactualExecutionInfo results={state.results} />
                      )}
                    </Flex>
                  </StackItem>
                  <CounterfactualHint
                    isVisible={state.status.executionStatus === 'NOT_STARTED'}
                  />
                  <CounterfactualSuccessMessage status={state.status} />
                  <StackItem>
                    <CounterfactualToolbar
                      status={state.status}
                      goals={state.goals}
                    />
                    <CounterfactualTable
                      inputs={state.searchDomains}
                      results={state.results}
                      status={state.status}
                      onOpenInputDomainEdit={handleInputDomainEdit}
                    />
                  </StackItem>
                </Stack>
              </section>
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </CFDispatch.Provider>
  );
};

export default Counterfactual;

export const CFDispatch = React.createContext<React.Dispatch<cfActions>>(null);

export interface CFSearchDomain {
  isFixed: boolean;
  name: string;
  typeRef: 'number' | 'string' | 'boolean';
  domain?: CFNumericalDomain | CFCategoricalDomain;
}

export interface CFNumericalDomain {
  type: 'numerical';
  lowerBound?: number;
  upperBound?: number;
}

export interface CFCategoricalDomain {
  type: 'categorical';
  categories: string[];
}

export interface CFSearchInput extends CFSearchDomain {
  value: number | string | boolean;
}

export type CFGoal = Pick<ItemObject, 'name' | 'typeRef' | 'value'> & {
  isFixed: boolean;
  originalValue: ItemObject['value'];
  id: string;
};

export type CFResult = Array<unknown>;

export interface CFStatus {
  isDisabled: boolean;
  executionStatus: 'RUN' | 'RUNNING' | 'NOT_STARTED';
  lastExecutionTime: null | string;
}

export type CFAnalysisResetType = 'NEW' | 'EDIT';

const cfResultsdemo: CFResult[] = [
  [33, 44, 56, 43],
  [12, 4, 3, 2],
  [1000, 1300, 1250, 1650],
  [500, 540, 420, 502],
  ['ALFA', 'BETA', 'GAMMA', 'DELTA'],
  [true, true, true, true]
];
