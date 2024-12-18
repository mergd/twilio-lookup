"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { AnimatePresence, motion } from "framer-motion";
import { AsYouType, parsePhoneNumber } from "libphonenumber-js";
import { PhoneIcon, ShieldCheckIcon, UserIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface PhoneInfo {
  phoneNumber: string;
  callerName: string | null;
  carrier: {
    name: string;
    type: string;
    mobileCountryCode: string;
    mobileNetworkCode: string;
  };
}

export function PhoneLookup() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneInfo, setPhoneInfo] = useState<PhoneInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const cachedResults = localStorage.getItem("phoneResults");
    if (cachedResults) {
      setPhoneInfo(JSON.parse(cachedResults));
    }
  }, []);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = new AsYouType("US").input(e.target.value);
    setPhoneNumber(formattedNumber);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const phoneNumberObj = parsePhoneNumber(phoneNumber, "US");

      if (!phoneNumberObj?.isValid()) {
        toast({
          title: "Invalid Phone Number",
          description: "Please enter a valid phone number",
          variant: "destructive",
        });
        return;
      }

      setPhoneNumber(phoneNumberObj.formatNational());
      setIsLoading(true);

      const response = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phoneNumberObj.format("E.164"),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to lookup phone number");
      }

      const result = await response.json();
      setPhoneInfo(result);
      localStorage.setItem("phoneResults", JSON.stringify(result));
      toast({
        title: "Lookup Successful",
        description: "Phone information retrieved successfully.",
      });
    } catch (error) {
      toast({
        title: "Lookup Failed",
        description: "An error occurred while looking up the phone number.",
        variant: "destructive",
      });
      console.error("Lookup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            Phone Number
          </Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="(555) 123-4567"
            className="font-mono"
            required
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Looking up..." : "Lookup Phone"}
        </Button>
      </form>

      <AnimatePresence>
        {phoneInfo && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="bg-card/50 backdrop-blur">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Phone Information</CardTitle>
                <CardDescription className="text-sm">
                  Details for{" "}
                  {parsePhoneNumber(phoneInfo.phoneNumber).formatNational()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center space-x-2">
                  <PhoneIcon className="h-4 w-4 text-primary" />
                  <span>
                    {parsePhoneNumber(phoneInfo.phoneNumber).formatNational()}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <UserIcon className="h-4 w-4 text-primary" />
                  <span>{phoneInfo.callerName || "Not available"}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ShieldCheckIcon className="h-4 w-4 text-primary" />
                  <span>
                    {phoneInfo.carrier?.name && phoneInfo.carrier?.type
                      ? `${phoneInfo.carrier.name} (${phoneInfo.carrier.type})`
                      : "Unknown carrier (likely VoIP number)"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Toaster />
    </div>
  );
}
