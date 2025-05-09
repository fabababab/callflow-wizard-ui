
export enum ModuleType {
  VERIFICATION = 'verification',
  INFORMATION = 'information',
  NACHBEARBEITUNG = 'nachbearbeitung',
  CONTRACT = 'contract',
  CONTRACT_MANAGEMENT = 'contract_management'
}

export interface ModuleConfig {
  id: string;
  title: string;
  type: ModuleType;
  data?: any;
}

export interface ModuleProps {
  id: string;
  title: string;
  data?: any;
  onClose?: () => void;
  onComplete?: (result: any) => void;
}
