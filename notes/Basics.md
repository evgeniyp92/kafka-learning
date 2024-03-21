# Topics

Topics in kafka are a particular stream of data. Its kind of like a table in a database, without the constraints.

You can have as many topics as you want, and they're identified by name. Message format is free choice

The sequence of messages is called a data stream.

Topics cannot be queried direct, we use Producers to send data and Consumers to send data.

## Partitions and offsets

Topics can be partitioned. Messages within each will be ordered sequentially and each message within a partition gets an
id called an _offset_

Topics are immutable. Once data is in a partition, its there for good.

### Example: truck_gps

A fleet of trucks pushes data to kafka with its id and gps position every 20 seconds. We can have a topic trucks_gps
that contains the position of all the trucks, with 10 partitions for, say, 10 trucks

Consumers can view the data via a location dashboard, or be notified via a notification service when their delivery is
close

## Key Notes

- Data in a partition is immutable
- Data is purged after a set time
- Offsets only have a meaning for a specific partition
  - Offset 3 in Part 1 !== Offset 3 in Part 0
  - Offsets are enver reused
- Order is guaranteed only within a partition (not across)
- Data is assigned to random partition unless a key is provided
- Amount of partitions is unlimited

## Producers and Message Keys

Producers write data to topics and they know what partition to write to, and which broker has the partition.

In case of broker failures, Producers can automatically recover

PRoducers can send a key with a message (any primitive)

If a key is null, data is sent round robin through the partitions

In the case of a non-null key, messages with that same key will always go the the same partition (hashing)

_Use keys when you need message ordering for a specific field (i.e. truck_id)_

Shape of a Kafka message

- Key - binary and can be null
- Value - binary and can be null
- Compression type - none/gzip/snappy/lz4/zstd
- Headers (optional) - set of key value pairs
- Partition + Offset
- Timestamp - set by system or user

Messages are prepared by the Kafka Message Serializer - this is where the speed comes from

Serialization transforms objects/data into bytes, but only on the value and keys

Serializers need to be manually specified, i.e. for nums specify an IntegerSerializer

### Common serializers are:

- String (including JSON)
- Int, Float
- Avro?
- Protobuf?

### Message key hashing

Kafka partitioners look at a record and determine what partition to send it to.

This is done via key hashing using the murmur2 algorithm

`targetPartition = Math.abs(Utils.murmur2(keyBytes)) % (numPartitions - 1)`

## Consumers and Deserialization

Consumers reaad data from a topic (identified by name) via a pull model i.e. they request it themselves

(So can consumers be alerted when there's new data or is the best strategy to just check periodically?)

Consumers automatically know which broker to read from and are fault-tolerant

Data is read from the lowest offset to the highest offset

### Deserialization

Consumers need to convert the binary to readable data, and therefore need to know about the kind of data coming through
and what deserializer to use, otherwise it will be mangled

(Can this be mapped some way via TS interfaces/types?)

Serialization/Deserialization tpye must not be changed during a topic lifecycle, just create a new topic instead

## Consumer Groups

All the consumers in an app read data as consumer group

A consumer group can have n consumers reading from exclusive partitions -- **no partition can be read by more than one
consumer in a consumer group**

This is a way of grouping many partitions and many consumers to read data together

### What if too many consumeres?

Some consumers can become inactive if there are more consumers than partitions. It will just be a standby consumer,
which is ok. Consumers cant team on a topic

It is acceptable though to have multiple consumer groups on the same topic i.e. two consumer groups reading from three
partitions of a topic

An example of having multiple consumer groups reading from the same topic is a service that logs truck gps positions in
general for EDL's, and another one that notifies customers when the truck with their package is close

Create distinct consumer groups with the consumer property `group.id`

### Consumer offsets

In groups we can define consumer offsets which will be stored in a helper Kafka topic called `__consumer_offsets`

Commiting offsets like this lets you cut down on amount of data requiring chunking, letting us pick up where we left off
consuming a topic

If a consumer dies it can pick up from where it left off thanks to the commited offsets

### Delivery Semantics for consumers

Java consumers automatiicaly commit offsets at least once

3 delivery semantics for committing manually

- At least once (usually preferred)
  - Offsets commited after message is processed
  - If processing breaks, message is read again
  - **MUST make sure duplicate processing of messages is idempotent (i.e. double processing wont break anything)**
- At most once
  - Offsets commited as soon as messages are received
  - Some messages may be lost if processing goes wrong
- Exactly once
  - For Kafka -> Kafka workflows -- use Transactional API (Easy with Kafka Streams API)
  - Kafka -> External Workflows -- use an idempotent consumer (wont break stuff rereading messages)

(Can idempotency be achieved in external workflows and the like by maintaining a local store of seen messages?)

## Brokers and Topics

A Kafka cluster is composed of multiple brokers (servers)

Eachj broker is identified with its Id (int) and contains certain topic partitions

After connecting to any broker (a bootstrap broker), yuo are connected to the entire cluster (handled by the Kafka
clusters (via federation?))

Some big clusters can have over 100 brokers 😵‍💫

Partitions of topics are distributed to all brokers in a cluster. Not all brokers will have all Topics, but through the
interconnect all data is available anyway

### Broker Discovery

Each broker acts as a bootstrap server in its own right.

Once you're connected to one broker, your client knows how to connect to the entire cluster because the bootstrap gives
you information on how to connect to each broker in the cluster, as well as which broker has what data, etc.

## Topic Replication factor

Topics should have a replication factor of more than 1 (usually between 2 and 3, most commonly 3)

Enables resiliency is a broker goes down

Think RAID 5 or RAID 6 for Kafka (kinda)

### Partition Leader

Only one broker can ever be a leader for a partition, and producers can **ONLY** send data to the partition leader. The
data is theen replicated to other partitions making in-sync replicas (ISRs)

Consumers also by default read from the leader of a partition

So replicas are pure redudncany really in the default config

### Consumer Replica Fetching after Kafka 2.4

Since 2.4 its possible to read from the closest replica instead of the partition leader, improving latency and reducing
cloud costs

## Producer Acks and Topic Durability

Producers can choose to receive acknowledgements of data writes

- acks=0: yeet and forget (guaranteed data loss if a broker has a problem)
- acks=1: wait for the leader to ack (limited data loss, recoverable)
- acks=all: wait for isr assurance (no data loss)

For a topic replication factor of 3, data durability can withstand 2 broker loss.

For N replication factors, you can permanently lost up to N-1 brokers and still keep your data

So it's RAID 1 on steroids

## Zookeeper

Zookeeper has been how Kafka has been able to function, but its slowly going away

zookeper manages a list of brokers and helps elect parition leaders

Zk sends notifications to kafka in case of changes (new topics, broker dies, broker comes ip, delete topics, etc)

### When to use Zookeeper?

Kafka 2.x and below cant work without Zookeeper

Kafka 3.x and up can work without Zookeeper using Kafka Raft instead (google KIP-500)

Kafka 4.x doesn't need zookeeper at all

Zookeeper by design operates with an odd number of servers (1,3,5,7 zookeepers)

Also followes leader-follower model

Zookeeper does not store consumer offsets anymore (since 0.10)

servers communicate laterally and each zookeeper is in charge of its own brokers

Zookeeper should be used with any kafka below 4.0

Over time Kafka clients and cli have been migrated to use brokers as connection endpoints instead of Zookeeper

Since 0.10 consumers store offset in brokers and must not connect to Zk for this, as it is deprecated

Since 2.2 `kafka-topics.sh` CLI references brokers and not Zk for topic management, Zk arg is deprecated

All APIs and commands have been migrated off Zookeper to prepare for a Zookeeperless Kafka

Zookeeper is also just less secure, only let it accept connections from brokers and not clients

**Never use Zookeeper as a config in clients, and other programs that connect to Kafka**

## Kafka KRaft

Zookeeper has scaling issues with Kafka Clusters over 100K partitions

Without Zk kafka can stale to millions of partitions, gets better stability, you get a single security model for the
whole system, it starts with a single process, easier monitiroing support and administrating, as well as faster shutdown
and recovery time

KRaft is implemented since 3.0 and has been prod ready since 3.3.1

4.0 will not have Zookeeper at all, only KRaft

### Key Difference

Instead of a lead zookeeper we have a designated Quorum Leader in a Quorum Controller.

**Huge** recovery time improvements after uncontrolled shutdown
