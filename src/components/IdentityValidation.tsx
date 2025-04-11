
import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertCircle, Phone, Mic, User, UserCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type ValidationItemProps = {
  label: string;
  status: 'verified' | 'pending' | 'failed';
};

type IdentifiedContact = {
  name: string;
  confidence: number;
  isVerified: boolean;
};

const ValidationItem = ({ label, status }: ValidationItemProps) => {
  const statusIcons = {
    verified: <Check size={16} className="text-callflow-success" />,
    pending: <div className="w-4 h-4 rounded-full border-2 border-callflow-muted-text border-t-transparent animate-spin"></div>,
    failed: <AlertCircle size={16} className="text-callflow-danger" />,
  };

  const statusClasses = {
    verified: "text-callflow-success border-callflow-success/20 bg-callflow-success/5",
    pending: "text-callflow-muted-text border-callflow-muted-text/20 bg-callflow-muted-text/5",
    failed: "text-callflow-danger border-callflow-danger/20 bg-callflow-danger/5",
  };

  return (
    <div className={cn(
      "flex items-center justify-between p-2 border rounded-md",
      statusClasses[status]
    )}>
      <span className="text-sm">{label}</span>
      {statusIcons[status]}
    </div>
  );
};

const IdentityValidation = () => {
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [identifiedContact, setIdentifiedContact] = useState<IdentifiedContact | null>(null);
  const [verificationStatus, setVerificationStatus] = useState({
    phoneNumber: 'pending' as 'verified' | 'pending' | 'failed',
    personalInfo: 'pending' as 'verified' | 'pending' | 'failed',
    voiceBiometrics: 'pending' as 'verified' | 'pending' | 'failed',
    securityQuestions: 'pending' as 'verified' | 'pending' | 'failed'
  });
  const [isVerifying, setIsVerifying] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Listen for contact identification event
  useEffect(() => {
    const handleContactIdentified = (event: CustomEvent<{name: string, confidence: number}>) => {
      setIdentifiedContact({
        name: event.detail.name,
        confidence: event.detail.confidence,
        isVerified: false
      });
      setIsOpen(true);
      setVerificationProgress(20);
    };

    window.addEventListener('contact-identified', handleContactIdentified as EventListener);
    
    return () => {
      window.removeEventListener('contact-identified', handleContactIdentified as EventListener);
    };
  }, []);

  const startVerification = (method: 'phone' | 'voice') => {
    setIsVerifying(true);
    
    // Simulate verification process
    if (method === 'phone') {
      setVerificationStatus({...verificationStatus, phoneNumber: 'verified'});
      
      setTimeout(() => {
        setVerificationStatus(prev => ({...prev, personalInfo: 'verified'}));
        setVerificationProgress(40);
        
        setTimeout(() => {
          setVerificationStatus(prev => ({...prev, securityQuestions: 'failed'}));
          setVerificationProgress(60);
          setIsVerifying(false);
        }, 2000);
      }, 1500);
    } else {
      setVerificationStatus({...verificationStatus, voiceBiometrics: 'verified'});
      
      setTimeout(() => {
        setVerificationStatus(prev => ({...prev, personalInfo: 'verified'}));
        setVerificationProgress(60);
        setIsVerifying(false);
      }, 2000);
    }
  };
  
  const startFullVerification = () => {
    setIsVerifying(true);
    
    // Reset verification statuses
    setVerificationStatus({
      phoneNumber: 'pending',
      personalInfo: 'pending',
      voiceBiometrics: 'pending',
      securityQuestions: 'pending'
    });
    
    // Simulate full verification process
    setTimeout(() => {
      setVerificationStatus(prev => ({...prev, phoneNumber: 'verified'}));
      setVerificationProgress(25);
      
      setTimeout(() => {
        setVerificationStatus(prev => ({...prev, personalInfo: 'verified'}));
        setVerificationProgress(50);
        
        setTimeout(() => {
          setVerificationStatus(prev => ({...prev, voiceBiometrics: 'verified'}));
          setVerificationProgress(75);
          
          setTimeout(() => {
            setVerificationStatus(prev => ({...prev, securityQuestions: 'verified'}));
            setVerificationProgress(100);
            
            if (identifiedContact) {
              setIdentifiedContact({...identifiedContact, isVerified: true});
            }
            
            setIsVerifying(false);
          }, 1500);
        }, 1500);
      }, 1500);
    }, 1500);
  };
  
  return (
    <Card className="rounded-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield size={18} className="text-callflow-primary" />
          <span>Identity Validation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!identifiedContact ? (
          <div className="flex items-center justify-center p-4 text-muted-foreground text-center">
            <div>
              <User size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">No contact identified yet</p>
              <p className="text-xs">Start a call to detect customer identity</p>
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  {identifiedContact.isVerified ? (
                    <UserCheck size={20} className="text-green-600" />
                  ) : (
                    <User size={20} className="text-blue-600" />
                  )}
                  <span className="font-medium">{identifiedContact.name}</span>
                </div>
                <Badge variant="outline" className={identifiedContact.isVerified ? 
                  "bg-green-50 text-green-700 border-green-200" : 
                  "bg-blue-50 text-blue-700 border-blue-200"
                }>
                  {identifiedContact.isVerified ? "Verified" : `${Math.round(identifiedContact.confidence * 100)}% match`}
                </Badge>
              </div>
              
              {!identifiedContact.isVerified && (
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Verify Identity
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-1" 
                        size="sm"
                        onClick={() => startVerification('phone')}
                        disabled={isVerifying}
                      >
                        <Phone size={14} />
                        <span>Phone Verification</span>
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full flex items-center gap-1" 
                        size="sm"
                        onClick={() => startVerification('voice')}
                        disabled={isVerifying}
                      >
                        <Mic size={14} />
                        <span>Voice Biometrics</span>
                      </Button>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">Verification Progress</span>
                <span className="text-sm">{verificationProgress}%</span>
              </div>
              <Progress value={verificationProgress} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <ValidationItem label="Phone Number Match" status={verificationStatus.phoneNumber} />
              <ValidationItem label="Personal Information" status={verificationStatus.personalInfo} />
              <ValidationItem label="Voice Biometrics" status={verificationStatus.voiceBiometrics} />
              <ValidationItem label="Security Questions" status={verificationStatus.securityQuestions} />
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full" 
                variant="default"
                onClick={startFullVerification}
                disabled={isVerifying || (identifiedContact && identifiedContact.isVerified)}
              >
                {isVerifying ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  "Start Full Verification"
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default IdentityValidation;
