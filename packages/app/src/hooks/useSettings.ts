import { useContext } from "react";
import { SettingsContext } from "../context/SettingsProvider";

const useSettings = () => {
  const [settings, dispatchSettings] = useContext(SettingsContext);
  return { settings, dispatchSettings };
};

export default useSettings;
