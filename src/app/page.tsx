"use client";

import { useState, useEffect } from "react";
import {
    Checkbox,
    Autocomplete,
    FormControlLabel,
    Grid2 as Grid,
    TextField,
} from "@mui/material";
import { Divider, Input, Table } from "antd";

const featureList = [
    "Standardised death rate",
    "Hospital Prone (0-10 and >= 75)",
    "Population",
    "time_to_nearest_hos",
];

export default function RankComponent() {
    const [rankedData, setRankedData] = useState(null);
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [maximize, setMaximize] = useState(
        Array(selectedFeatures.length).fill(false)
    );
    const [council, setCouncil] = useState("");

    useEffect(() => {
        console.log(maximize);
    }, [maximize]);

    const handleCouncilChange = (event) => {
        setCouncil(event.target.value); // Update the council state with input value
    };

    const handleFeatureChange = (event, value) => {
        setSelectedFeatures(value);

        // Update maximize array to match the new length of selectedFeatures
        setMaximize((prevMaximize) => {
            const newMaximize = [...prevMaximize];
            // For each new feature added, initialize the corresponding maximize value to false
            value.forEach((feature, index) => {
                if (newMaximize[index] === undefined) {
                    newMaximize[index] = false;
                }
            });
            return newMaximize.slice(0, value.length); // Ensure maximize array matches the selected features length
        });
    };

    const handleMaximizeChange = (index) => {
        // Toggle the maximize state for the feature at the given index
        const newMaximize = [...maximize];
        newMaximize[index] = !newMaximize[index];
        setMaximize(newMaximize);
    };

    // Function to call Flask API
    const getRankedData = async () => {
        const requestData = {
            features: selectedFeatures,
            maximize: maximize,
            weights: Array(selectedFeatures.length).fill(0.25),
            council: council, // "Hobsons Bay"
        };

        console.log("requestData", requestData);

        try {
            const response = await fetch("http://127.0.0.1:5000/rank", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestData),
            });

            if (response.ok) {
                const data = await response.json();
                setRankedData(data); // Save the result in state
            } else {
                console.error("Error:", response.statusText);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };
    // Define the columns for Ant Design Table
    const columns = [
        {
            title: "Rank",
            dataIndex: "Rank",
            key: "rank",
        },
        {
            title: "SA2 Code",
            dataIndex: "SA2 Code",
            key: "sa2Code",
        },
        {
            title: "Area",
            dataIndex: "Area",
            key: "area",
        },
    ];

    return (
        <div>
            <Autocomplete
                multiple
                id="tags-outlined"
                options={featureList}
                getOptionLabel={(option) => option}
                // defaultValue={[featureList[13]]}
                filterSelectedOptions
                onChange={handleFeatureChange}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Select Features"
                        placeholder="Features"
                    />
                )}
            />

            <Input
                size="large"
                placeholder="Council"
                className="mt-4"
                value={council}
                onChange={handleCouncilChange}
            />

            <Grid container spacing={2}>
                {selectedFeatures.map((feature, index) => (
                    <Grid item key={feature}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={maximize[index] || false} // Set checked based on maximize state
                                    onChange={() => handleMaximizeChange(index)} // Handle checkbox toggle
                                />
                            }
                            label={`Maximize ${feature}`}
                        />
                    </Grid>
                ))}
            </Grid>

            <button onClick={getRankedData}>Get Ranked Data</button>

            {rankedData && (
                <>
                    <Divider>Most Suitable Suburbs to Build a Hospital</Divider>
                    <Table
                        columns={columns}
                        dataSource={rankedData.map((row, index) => ({
                            ...row,
                            key: index, // Add unique key for each row
                        }))}
                        size="middle"
                    />
                </>
            )}
        </div>
    );
}
