"""
train_all.py — One-shot script to train ALL FleetFlow AI models.
Run this once after installing requirements.

Usage:
    cd ai-service
    python train_all.py
"""

import subprocess
import sys


def run(module: str):
    print(f"\n{'═' * 60}")
    print(f"  Training: {module}")
    print(f"{'═' * 60}")
    result = subprocess.run(
        [sys.executable, "-m", module],
        capture_output=False,
    )
    if result.returncode != 0:
        print(f"❌ {module} failed with exit code {result.returncode}")
    else:
        print(f"✅ {module} complete")


if __name__ == "__main__":
    run("training.train_maintenance")
    run("training.train_fuel")
    run("training.train_delay")
    print("\n\n🎉 All models trained! Start the server with:")
    print("    uvicorn main:app --reload --port 8001")
