import type { ProcessActivity } from "../@types/processs";

const taskTags = [
  "bpmn:task",
  "bpmn:userTask",
  "bpmn:manualTask",
  "bpmn:serviceTask",
  "bpmn:scriptTask",
  "bpmn:businessRuleTask",
  "bpmn:sendTask",
  "bpmn:receiveTask",
];

function getActivityType(tagName: string) {
  if (tagName.includes("userTask") || tagName.includes("manualTask")) {
    return "manual";
  }

  if (
    tagName.includes("serviceTask") ||
    tagName.includes("scriptTask") ||
    tagName.includes("businessRuleTask")
  ) {
    return "system";
  }

  return "manual";
}

export function extractActivitiesFromBpmn(xml: string): ProcessActivity[] {
  if (!xml) {
    return [];
  }

  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "text/xml");

  const activities: ProcessActivity[] = [];

  taskTags.forEach((tag) => {
    const elements = Array.from(documentXml.getElementsByTagName(tag));

    elements.forEach((element) => {
      const id = element.getAttribute("id");
      const name = element.getAttribute("name");

      if (!id) {
        return;
      }

      activities.push({
        id,
        name: name || "Atividade sem nome",
        type: getActivityType(tag) as ProcessActivity["type"],
        criticality: "medium",
      });
    });
  });

  return activities;
}

export function mergeExtractedActivities(
  currentActivities: ProcessActivity[],
  extractedActivities: ProcessActivity[]
): ProcessActivity[] {
  return extractedActivities.map((extracted) => {
    const existing = currentActivities.find(
      (activity) => activity.id === extracted.id
    );

    return {
      ...extracted,
      ...existing,
      name: extracted.name,
    };
  });
}