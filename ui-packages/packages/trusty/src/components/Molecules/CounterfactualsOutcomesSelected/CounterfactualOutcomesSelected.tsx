import React, { useEffect, useState } from 'react';
import { List, ListItem, ListVariant } from '@patternfly/react-core';
import { CFGoal } from '../../Templates/Counterfactual/Counterfactual';

type CounterfactualOutcomesSelectedProps = {
  goals: CFGoal[];
};

const CounterfactualOutcomesSelected = ({
  goals
}: CounterfactualOutcomesSelectedProps) => {
  const [selectedOutcomes, setSelectedOutcomes] = useState<CFGoal[]>([]);

  useEffect(() => {
    setSelectedOutcomes(goals.filter(goal => !goal.isFixed));
  }, [goals]);

  return (
    <>
      {selectedOutcomes.length > 0 && (
        <List
          variant={ListVariant.inline}
          style={{ color: 'var(--pf-global--Color--200)' }}
        >
          <ListItem key="selected outcomes">
            <span>Selected Outcomes:</span>{' '}
            {selectedOutcomes.map((goal, index) => (
              <span key={goal.id}>
                <span>
                  {goal.name}: {goal.value.toString()}
                </span>
                {index + 1 !== selectedOutcomes.length && <span>, </span>}
              </span>
            ))}
          </ListItem>
        </List>
      )}
    </>
  );
};

export default CounterfactualOutcomesSelected;
