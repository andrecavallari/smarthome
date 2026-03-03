interface Scene {
  actions: {
    action_executor: string;
    entity_id: string;
    executor_property: Record<string, string>;
  }[];
  background: string;
  enabled: boolean;
  name: string;
  scene_id: string;
  status: string;
}
