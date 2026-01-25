'use client';

import { useState } from 'react';
import { Facebook, SlidersHorizontal } from 'lucide-react';
import { BlueskyIcon } from '@/components/icons';
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ConfigPanel() {
  const [threshold, setThreshold] = useState(70);

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-semibold">Configuration</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Supported Platforms</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            <div className="p-3 rounded-md bg-muted border">
              <div className="flex items-center gap-2 mb-1">
                <BlueskyIcon className="w-5 h-5 text-blue-400" />
                <Label className="font-semibold text-sm">Bluesky</Label>
              </div>
              <p className="text-xs text-muted-foreground">Paste a post URL from bsky.app</p>
            </div>
            <div className="p-3 rounded-md bg-muted border">
              <div className="flex items-center gap-2 mb-1">
                <Facebook className="w-5 h-5 text-blue-600" />
                <Label className="font-semibold text-sm">Facebook</Label>
              </div>
              <p className="text-xs text-muted-foreground">Paste a page or post URL from facebook.com</p>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Model Parameters</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="confidence-threshold">Confidence Threshold</Label>
              <div className="flex items-center gap-4">
                <Slider id="confidence-threshold" value={[threshold]} onValueChange={(value) => setThreshold(value[0])} max={100} step={1} />
                <span className="text-sm text-muted-foreground w-12 text-right">{threshold}%</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="model-version">Model Version</Label>
              <Select defaultValue="v2.1-beta">
                <SelectTrigger id="model-version" className="w-full">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v2.1-beta">v2.1-beta (Default)</SelectItem>
                  <SelectItem value="v2.0-stable">v2.0-stable</SelectItem>
                  <SelectItem value="v1.5-legacy">v1.5-legacy</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </>
  );
}
