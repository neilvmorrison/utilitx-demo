"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { loadFromStorage, saveToStorage } from "@/lib/storage";

const STORAGE_KEY_VIEW_STATE = "view-state";
const QUERY_PARAM_PROJECT_ID = "projectId";
const QUERY_PARAM_LONGITUDE = "lng";
const QUERY_PARAM_LATITUDE = "lat";
const QUERY_PARAM_ZOOM = "zoom";
const QUERY_PARAM_PITCH = "pitch";
const QUERY_PARAM_BEARING = "bearing";

export interface IMapViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

interface IUseShareableViewStateProps {
  fallbackViewState: IMapViewState;
  activeProjectId: string | null;
  setActiveProject: (id: string | null) => void;
}

function toFiniteNumber(value: string | null): number | null {
  if (value === null) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseViewStateFromUrl(search: string): IMapViewState | null {
  const params = new URLSearchParams(search);
  const longitude = toFiniteNumber(params.get(QUERY_PARAM_LONGITUDE));
  const latitude = toFiniteNumber(params.get(QUERY_PARAM_LATITUDE));
  const zoom = toFiniteNumber(params.get(QUERY_PARAM_ZOOM));
  const pitch = toFiniteNumber(params.get(QUERY_PARAM_PITCH));
  const bearing = toFiniteNumber(params.get(QUERY_PARAM_BEARING));

  if (
    longitude === null ||
    latitude === null ||
    zoom === null ||
    pitch === null ||
    bearing === null
  ) {
    return null;
  }

  return { longitude, latitude, zoom, pitch, bearing };
}

export function useShareableViewState({
  fallbackViewState,
  activeProjectId,
  setActiveProject,
}: IUseShareableViewStateProps) {
  const urlViewState = useMemo(() => {
    if (typeof window === "undefined") return null;
    return parseViewStateFromUrl(window.location.search);
  }, []);

  const initialViewState = useMemo(
    () => urlViewState ?? loadFromStorage(STORAGE_KEY_VIEW_STATE, fallbackViewState),
    [fallbackViewState, urlViewState],
  );

  const viewStateRef = useRef<IMapViewState>(initialViewState);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const projectId = new URLSearchParams(window.location.search).get(
      QUERY_PARAM_PROJECT_ID,
    );
    if (projectId) {
      setActiveProject(projectId);
    }
  }, [setActiveProject]);

  const handleViewStateChange = useCallback((viewState: IMapViewState) => {
    viewStateRef.current = viewState;
    saveToStorage(STORAGE_KEY_VIEW_STATE, viewState);
  }, []);

  const shareViewStateLink = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    const currentViewState = viewStateRef.current;
    const params = new URLSearchParams(window.location.search);
    params.set(QUERY_PARAM_LONGITUDE, String(currentViewState.longitude));
    params.set(QUERY_PARAM_LATITUDE, String(currentViewState.latitude));
    params.set(QUERY_PARAM_ZOOM, String(currentViewState.zoom));
    params.set(QUERY_PARAM_PITCH, String(currentViewState.pitch));
    params.set(QUERY_PARAM_BEARING, String(currentViewState.bearing));

    if (activeProjectId) {
      params.set(QUERY_PARAM_PROJECT_ID, activeProjectId);
    } else {
      params.delete(QUERY_PARAM_PROJECT_ID);
    }

    const shareUrl =
      `${window.location.origin}${window.location.pathname}` +
      `?${params.toString()}${window.location.hash}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } catch {
      return false;
    }
  }, [activeProjectId]);

  return {
    initialViewState,
    handleViewStateChange,
    shareViewStateLink,
  };
}
