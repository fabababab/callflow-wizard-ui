
import { ModuleType } from '@/types/modules';
import VerificationModule from './VerificationModule';
import InformationModule from './InformationModule';
import NachbearbeitungModule from './NachbearbeitungModule';
import ContractModule from './ContractModule';
import ContractManagementModule from './ContractManagementModule';
import QuizModule from './QuizModule';
import FranchiseModule from './FranchiseModule';

// This file serves as a registry to map module types to their respective components
const ModuleRegistry = {
  [ModuleType.VERIFICATION]: VerificationModule,
  [ModuleType.INFORMATION]: InformationModule,
  [ModuleType.NACHBEARBEITUNG]: NachbearbeitungModule,
  [ModuleType.CONTRACT]: ContractModule,
  [ModuleType.CONTRACT_MANAGEMENT]: ContractManagementModule,
  [ModuleType.QUIZ]: QuizModule,
  [ModuleType.FRANCHISE]: FranchiseModule,
};

export default ModuleRegistry;
