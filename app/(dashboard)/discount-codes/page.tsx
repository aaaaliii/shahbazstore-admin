"use client";

import { useEffect, useState } from "react";
import DiscountCodesClient from "./DiscountCodesClient";
import { discountCodesApi, DiscountCode } from "../../../lib/api/discountCodes.api";

export default function DiscountCodesPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCodes = async () => {
      try {
        setLoading(true);
        const codesData = await discountCodesApi.getAll();
        setCodes(codesData);
      } catch (error: any) {
        console.error('Error fetching discount codes:', error);
        setCodes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCodes();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading discount codes...</div>
      </div>
    );
  }

  return (
    <DiscountCodesClient
      initialCodes={codes}
    />
  );
}
