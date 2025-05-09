
import React from 'react';
import { ModuleRegistryItem, ModuleType } from '@/types/modules';
import VerificationModule from './VerificationModule';
import ContractModule from './ContractModule';
import InformationModule from './InformationModule';

const moduleRegistry: Record<ModuleType, ModuleRegistryItem> = {
  [ModuleType.VERIFICATION]: {
    type: ModuleType.VERIFICATION,
    component: VerificationModule
  },
  [ModuleType.CONTRACT]: {
    type: ModuleType.CONTRACT,
    component: ContractModule
  },
  [ModuleType.INFORMATION]: {
    type: ModuleType.INFORMATION,
    component: InformationModule
  }
};

export default moduleRegistry;
