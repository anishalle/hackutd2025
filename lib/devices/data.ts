import { DeviceContext } from "@/lib/gemini-api";

export interface Device extends DeviceContext {
  id: string;
  manufacturer?: string;
  model?: string;
}

export const datacenterDevices: Device[] = [
  {
    id: "h100-gpu",
    name: "NVIDIA H100 GPU",
    category: "Compute Accelerator",
    manufacturer: "NVIDIA",
    model: "H100 80GB HBM3",
    specifications:
      "80GB HBM3 memory, 700W TDP, PCIe Gen5, NVLink 4.0 support, Hopper architecture",
    commonIssues: [
      "Thermal throttling under sustained load",
      "NVLink connection failures",
      "Memory ECC errors",
      "Power delivery issues",
    ],
    installationNotes:
      "Requires PCIe Gen5 slot, adequate cooling (3-slot design), proper power connectors (2x 12VHPWR), and NVLink bridge if using multi-GPU setup. Always update firmware before installation.",
  },
  {
    id: "qsfp-dd-optic",
    name: "QSFP-DD 400G Optics",
    category: "Networking",
    manufacturer: "Various",
    model: "QSFP-DD 400G",
    specifications:
      "400Gbps bandwidth, up to 2km reach (SMF), hot-swappable, low power consumption",
    commonIssues: [
      "Fiber contamination causing signal loss",
      "Incorrect SFP configuration",
      "Exceeded bend radius",
      "Temperature-related shutdowns",
    ],
    installationNotes:
      "Clean fiber connectors before insertion, verify proper seating with audible click, check link lights, avoid sharp bends in fiber. Use optical power meter to verify signal strength.",
  },
  {
    id: "nvswitch",
    name: "NVIDIA NVSwitch",
    category: "Interconnect",
    manufacturer: "NVIDIA",
    model: "NVSwitch Gen3",
    specifications:
      "900GB/s total bandwidth, 64 NVLink ports, ultra-low latency GPU-to-GPU communication",
    commonIssues: [
      "Port failures or flapping",
      "Firmware incompatibility",
      "Thermal issues in dense configurations",
      "Incorrect topology configuration",
    ],
    installationNotes:
      "Ensure all NVLink cables are firmly seated, update firmware to match GPU firmware version, verify cooling airflow direction, follow NVIDIA reference topology diagrams.",
  },
  {
    id: "liquid-cooling",
    name: "Liquid Cooling Loop",
    category: "Cooling System",
    specifications:
      "Cold plate design, 30kW+ cooling capacity per rack, leak detection sensors, redundant pumps",
    commonIssues: [
      "Air bubbles in loop",
      "Pump failures",
      "Coolant leaks at connections",
      "Blockage in cold plates",
      "Flow rate below threshold",
    ],
    installationNotes:
      "Check all quick-disconnect fittings for proper seating, bleed air from system, verify flow sensors operational, test leak detection system before powering equipment. Monitor coolant temperature and flow rate continuously.",
  },
  {
    id: "pdu-smart",
    name: "Smart PDU (Power Distribution Unit)",
    category: "Power Management",
    specifications:
      "208V 3-phase, 60A per phase, remote monitoring, per-outlet switching, environmental sensors",
    commonIssues: [
      "Network connectivity failures",
      "Breaker trips under load",
      "Incorrect voltage readings",
      "Firmware update failures",
    ],
    installationNotes:
      "Verify phase voltage and balance before connecting loads, configure network settings via serial console first, test all outlets before production use, set proper overcurrent thresholds.",
  },
  {
    id: "mtp-fiber",
    name: "MTP-24 Fiber Trunk",
    category: "Cabling",
    specifications:
      "24-fiber connector, single-mode or multi-mode, low insertion loss (<0.3dB), high return loss (>60dB)",
    commonIssues: [
      "Fiber breakage from over-tightening",
      "Polarity mismatches",
      "High insertion loss",
      "Contaminated end faces",
    ],
    installationNotes:
      "Never exceed minimum bend radius (25mm dynamic, 50mm static), inspect end faces with fiber microscope, use proper polarity (Type A, B, or C), document cable paths and labeling.",
  },
  {
    id: "infiniband-hdr",
    name: "InfiniBand HDR Switch",
    category: "Networking",
    manufacturer: "NVIDIA/Mellanox",
    specifications:
      "200Gbps per port, ultra-low latency (<600ns), adaptive routing, RDMA support",
    commonIssues: [
      "Subnet manager configuration errors",
      "Cable compatibility issues",
      "Firmware bugs causing port flapping",
      "Overheating in high-density configs",
    ],
    installationNotes:
      "Configure subnet manager before connecting to fabric, use certified cables only, ensure adequate front-to-back airflow, update to latest stable firmware.",
  },
  {
    id: "ceph-storage",
    name: "Ceph Storage Node",
    category: "Storage",
    specifications:
      "24x NVMe drives, dual 100GbE network, RAID controller, hot-swap bays",
    commonIssues: [
      "Drive failures and rebuild storms",
      "Network saturation during rebalancing",
      "OSD crashes",
      "Clock synchronization issues",
    ],
    installationNotes:
      "Install drives in correct bay order per cluster plan, configure bonded network interfaces, sync NTP before joining cluster, set proper CRUSH map weights.",
  },
  {
    id: "ups-battery",
    name: "UPS Battery Module",
    category: "Power Protection",
    specifications:
      "Lithium-ion or VRLA, hot-swappable, 5-10 minute runtime at full load, battery management system",
    commonIssues: [
      "Battery age/capacity degradation",
      "BMS communication failures",
      "Thermal runaway (Li-ion)",
      "Connection resistance buildup",
    ],
    installationNotes:
      "Check battery production date (max 6 months old), verify voltage before installation, torque battery terminals to spec (don't over-tighten), test runtime after installation.",
  },
  {
    id: "chiller-unit",
    name: "Precision Chiller Unit",
    category: "Cooling System",
    specifications:
      "500kW+ cooling capacity, variable speed compressors, integrated controls, redundant pumps",
    commonIssues: [
      "Refrigerant leaks",
      "Compressor failures",
      "Control board malfunctions",
      "Condenser fouling",
    ],
    installationNotes:
      "Verify power requirements match facility, check refrigerant charge levels, configure setpoints according to facility load, integrate with BMS for monitoring.",
  },
];

export const predefinedQuestions: Record<string, string[]> = {
  "h100-gpu": [
    "How do I properly install and seat the H100 GPU?",
    "What are the power requirements and cable connections?",
    "How do I configure NVLink for multi-GPU setups?",
    "What should I check if the GPU is thermal throttling?",
    "How do I update the firmware safely?",
  ],
  "qsfp-dd-optic": [
    "How do I clean fiber optic connectors properly?",
    "What causes high insertion loss and how to fix it?",
    "How do I verify the optical link is working correctly?",
    "What's the proper way to handle and route fiber cables?",
    "How do I troubleshoot a link that won't come up?",
  ],
  "nvswitch": [
    "How do I install NVSwitch in a multi-GPU system?",
    "What's the correct NVLink cable installation procedure?",
    "How do I update NVSwitch firmware?",
    "What should I check if NVLink ports are failing?",
    "How do I verify the NVSwitch topology is correct?",
  ],
  "liquid-cooling": [
    "How do I bleed air from the cooling loop?",
    "What are the signs of a coolant leak?",
    "How do I test the leak detection system?",
    "What flow rate should I expect for normal operation?",
    "How do I add or replace coolant safely?",
  ],
  "pdu-smart": [
    "How do I configure the PDU network settings?",
    "What's the proper load balancing procedure?",
    "How do I update PDU firmware?",
    "How do I troubleshoot a tripped breaker?",
    "What environmental thresholds should I set?",
  ],
  "mtp-fiber": [
    "How do I determine the correct fiber polarity?",
    "What's the proper way to inspect fiber end faces?",
    "How do I install MTP connectors without damage?",
    "What are the bend radius requirements?",
    "How do I measure insertion loss?",
  ],
  "infiniband-hdr": [
    "How do I configure the subnet manager?",
    "What cables are compatible with HDR InfiniBand?",
    "How do I troubleshoot port flapping issues?",
    "What's the proper firmware update procedure?",
    "How do I verify RDMA is working correctly?",
  ],
  "ceph-storage": [
    "How do I properly install NVMe drives in the correct order?",
    "What network configuration is recommended?",
    "How do I join a new node to the Ceph cluster?",
    "What should I do when an OSD crashes?",
    "How do I check the health of the storage cluster?",
  ],
  "ups-battery": [
    "How do I safely install a battery module?",
    "What voltage should I expect from a healthy battery?",
    "How do I test the runtime capacity?",
    "What are signs of battery degradation?",
    "How often should batteries be replaced?",
  ],
  "chiller-unit": [
    "How do I check refrigerant levels?",
    "What maintenance should I perform regularly?",
    "How do I configure temperature setpoints?",
    "What are signs of compressor failure?",
    "How do I troubleshoot control board issues?",
  ],
};

export function getDeviceById(id: string): Device | undefined {
  return datacenterDevices.find((device) => device.id === id);
}

