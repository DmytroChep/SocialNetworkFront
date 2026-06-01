import React, { createContext, useContext, useState, ReactNode } from "react";

export interface ModalUser {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  avatarColor?: string;
}

export interface Contact {
  id: string | number;
  name: string;
  avatar?: string;
  avatarColor?: string;
}

type GroupCreationContextType = {
  step: 0 | 1 | 2;
  selectedUsers: ModalUser[];
  contacts?: Contact[];
  openStep1: (contacts?: Contact[]) => void;
  openStep2: (users: ModalUser[]) => void;
  close: () => void;
  back: () => void;
  removeUser: (id: string) => void;
  setSelectedUsers: (users: ModalUser[]) => void;
};

const GroupCreationContext = createContext<GroupCreationContextType | null>(null);

export function GroupCreationProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [selectedUsers, setSelectedUsers] = useState<ModalUser[]>([]);
  const [contacts, setContacts] = useState<Contact[] | undefined>(undefined);

  const openStep1 = (c?: Contact[]) => {
    setContacts(c);
    setSelectedUsers([]);
    setStep(1);
  };

  const openStep2 = (users: ModalUser[]) => {
    setSelectedUsers(users);
    setStep(2);
  };

  const back = () => setStep(1);

  const close = () => {
    setStep(0);
    setSelectedUsers([]);
    setContacts(undefined);
  };

  const removeUser = (id: string) => setSelectedUsers((prev) => prev.filter((u) => u.id !== id));

  return (
    <GroupCreationContext.Provider
      value={{
        step,
        selectedUsers,
        contacts,
        openStep1,
        openStep2,
        close,
        back,
        removeUser,
        setSelectedUsers,
      }}
    >
      {children}
    </GroupCreationContext.Provider>
  );
}

export function useGroupCreation() {
  const ctx = useContext(GroupCreationContext);
  if (!ctx) throw new Error("useGroupCreation must be used within GroupCreationProvider");
  return ctx;
}

export default GroupCreationContext;
