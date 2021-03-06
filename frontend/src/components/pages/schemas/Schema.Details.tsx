import { Col, Descriptions, Row, Select, Statistic, Table } from 'antd';
import Card from '../../misc/Card';
import { observer } from 'mobx-react';
import React from 'react';
import { appGlobal } from '../../../state/appGlobal';
import { api } from '../../../state/backendApi';
import { PageComponent, PageInitHelper } from '../Page';
import { DefaultSkeleton, Label } from '../../../utils/tsxUtils';
import { motion } from 'framer-motion';
import { animProps } from '../../../utils/animationProps';
import { KowlJsonView } from '../../misc/KowlJsonView';
import { sortField } from '../../misc/common';

export interface SchemaDetailsProps {
    subjectName: string;
    query: {
        version: number;
    };
}

function renderSchemaDataList(entries: string[][]) {
    return (
        <Descriptions bordered size="small" colon={true} layout="horizontal" column={1}>
            {entries
                .filter(([_, text]) => text !== undefined)
                .map(([label, text]) => (
                    <Descriptions.Item label={label} key={label}>{text}</Descriptions.Item>
                ))}
        </Descriptions>
    );
}

function renderOptions(options: number[] = []) {
    return options.map((option) => <Select.Option value={option} key={option}>Version {option}</Select.Option>);
}

@observer
class SchemaDetailsView extends PageComponent<SchemaDetailsProps> {
    initPage(p: PageInitHelper): void {
        const {
            subjectName,
            query: { version },
        } = this.props;
        p.title = subjectName;
        p.addBreadcrumb('Schema Registry', '/schema-registry');
        p.addBreadcrumb(subjectName, `/schema-registry/${subjectName}?version=${version}`);
        this.refreshData(false);
        appGlobal.onRefresh = () => this.refreshData(true);
    }

    refreshData(force?: boolean) {
        api.refreshSchemaDetails(this.props.subjectName, this.props.query.version, force);
    }

    componentDidUpdate({ query: { version } }: SchemaDetailsProps) {
        if (this.props.query.version !== version) {
            this.refreshData(true);
        }
    }

    render() {
        if (!api.schemaDetails) return DefaultSkeleton;

        const {
            schemaId,
            schema: { type, name, namespace, doc, fields },
        } = api.schemaDetails;

        return (
            <motion.div {...animProps} key={'b'} style={{ margin: '0 1rem' }}>
                <Card>
                    <Row>
                        <Statistic title="Subject Name" value={this.props.subjectName}></Statistic>
                        <Statistic title="Subject ID" value={schemaId}></Statistic>
                    </Row>
                </Card>
                <Card>
                    <Row gutter={[32, 24]}>
                        <Col span="24">
                            <span>
                                <Label text="Version">
                                    <Select defaultValue={this.props.query.version} onChange={(version) => appGlobal.history.push(`/schema-registry/${this.props.subjectName}?version=${version}`)}>
                                        {renderOptions(api.schemaDetails?.registeredVersions)}
                                    </Select>
                                </Label>
                            </span>
                        </Col>
                    </Row>
                    <Row gutter={32}>
                        <Col xl={{ span: 12, order: 1 }} xs={{ span: 24, order: 2 }}>
                            <KowlJsonView
                                src={api.schemaDetails || {}}
                                style={{
                                    border: 'solid thin lightgray',
                                    borderRadius: '.25em',
                                    padding: '1em 1em 1em 2em',
                                    marginBottom: '1.5rem',
                                }}
                            />
                        </Col>
                        <Col xl={{ span: 12, order: 2 }} xs={{ span: 24, order: 1 }}>
                            {renderSchemaDataList([
                                ['type', type],
                                ['name', name],
                                ['namespace', namespace],
                                ['doc', doc],
                            ])}
                            <Table
                                size="middle"
                                columns={[
                                    { title: 'Name', dataIndex: 'name', className: 'whiteSpaceDefault', sorter: sortField('name') },
                                    { title: 'Type', dataIndex: 'type', className: 'whiteSpaceDefault', sorter: sortField('type') },
                                    { title: 'Default', dataIndex: 'default', className: 'whiteSpaceDefault' },
                                    { title: 'Documentation', dataIndex: 'doc', className: 'whiteSpaceDefault' },
                                ]}
                                rowKey="name"
                                dataSource={fields}
                                pagination={false}
                                style={{
                                    maxWidth: '100%',
                                    marginTop: '1.5rem',
                                    marginBottom: '1.5rem',
                                }}
                            ></Table>
                        </Col>
                    </Row>
                </Card>
            </motion.div>
        );
    }
}

export default SchemaDetailsView;
