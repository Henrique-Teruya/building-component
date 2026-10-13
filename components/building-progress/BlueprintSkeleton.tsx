"use client";

import { BlueprintScan } from "@/components/blueprint/blueprint-scan/BlueprintScan";

interface BlueprintSkeletonProps {
  projectName?: string;
}

export function BlueprintSkeleton({ projectName }: BlueprintSkeletonProps) {
  return <BlueprintScan projectName={projectName} />;
}
