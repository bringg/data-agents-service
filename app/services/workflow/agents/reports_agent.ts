import {  WorkflowStateType } from "../graph/types";

export const reportsAgent = async (state: WorkflowStateType) => {
    // Use the Reports API Tool to generate a report

    return {
      messages: [
        new HumanMessage({
          content: "Reports Agent: Generated report using Reports API Tool."
        })
      ]
    };