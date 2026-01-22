'use client';

import { useState } from 'react';
import { Facebook, SlidersHorizontal, Twitter } from 'lucide-react';
import { RedditIcon } from '@/components/icons';
import {
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
          <SidebarGroupLabel>Data Sources</SidebarGroupLabel>
          <SidebarGroupContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="twitter-source" className="flex items-center gap-2 cursor-pointer">
                <Twitter className="w-5 h-5 text-sky-500" />
                Twitter
              </Label>
              <Switch id="twitter-source" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="facebook-source" className="flex items-center gap-2 cursor-pointer">
                <Facebook className="w-5 h-5 text-blue-600" />
                Facebook
              </Label>
              <Switch id="facebook-source" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="reddit-source" className="flex items-center gap-2 cursor-pointer">
                <RedditIcon className="w-5 h-5 text-orange-500" />
                Reddit
              </Label>
              <Switch id="reddit-source" />
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
